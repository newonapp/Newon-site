# LIVON Performance

LIVON Performance Optimization V1 — loading, rendering, start-up, assets and build output.
Base: `29628c2ef` (Accessibility Hardening V1). Branch: `livon-performance-v1`.

Everything in this document was measured in a lab. No number here is field data from real visitors, and nothing here
says that real visitors pass Core Web Vitals. Lighthouse was not run (it could not be installed in the measurement
environment), so there is no Lighthouse score in this document. Where something could not be measured it is marked
**NOT MEASURED**.

Order of work: measure → find the bottleneck → fix → measure again → check for regressions.

## Method

| Item | Value |
|---|---|
| Browser | Chromium 141 (Playwright build 1194), headless, driven over the DevTools protocol |
| Server | local static server with gzip and `Cache-Control: max-age=600` (the production host, GitHub Pages, also sends gzip and `max-age=600`) |
| "Before" | the published output of commit `29628c2ef` |
| "After" | the same output with this branch's `livon/` and `assets/` sources |
| Desktop profile | 1440×900, no throttling |
| Mobile-like profile | 390×844, Fast 4G (9 Mbps down, 1.5 Mbps up, 60 ms latency), 4× CPU slowdown |
| Cold run | HTTP cache disabled, median of 3 |
| Warm run | second visit in the same browser context, HTTP cache enabled |
| Metrics | FCP, LCP, CLS (PerformanceObserver); long tasks → blocking time (sum of task time over 50 ms after FCP); DOMContentLoaded and load (Navigation Timing); requests and transfer size (DevTools Network); script / layout / style time, DOM nodes, listeners, heap (DevTools Performance) |
| Interaction latency | Event Timing entries with an `interactionId` while scripted user tasks run. This is a lab stand-in for INP, not INP itself. |
| Third-party hosts | not reachable from the lab. Web-font CSS and the GSAP script are answered with an empty 200, film requests with a small local WebM, and every such request is counted. |
| Large data | synthetic fixtures written to an empty browser profile: 300 Community posts with 40 comments, 200 My Life todos, 300 saved items (the store keeps 200). No real user data was read. |

Severity scale used in the audit:

| Severity | Meaning |
|---|---|
| CRITICAL | fails a Core Web Vitals "good" threshold by a wide margin on the desktop profile, or wastes megabytes or hundreds of requests on every visit, or never finishes |
| HIGH | a lab metric in the "poor" band, a page that cannot finish loading, or start-up blocking of 2 s or more on the mobile-like profile |
| MEDIUM | a metric that is poor only on the mobile-like profile (blocking between 0.6 s and 2 s), or a bounded waste |
| LOW | small, or visible only in special conditions |

The scale was fixed for this phase by the author; the raw numbers are given next to every finding so the reader can apply a different one.

## Baseline

What the baseline measurements showed, before any change:

| ID | Severity | Finding | Evidence (before) |
|---|---|---|---|
| P-01 | CRITICAL | The page's own `<style>` block (38 KB — it decides which of the eight screens is visible) sat after `</main>`. All eight screens were painted, then seven were hidden. | CLS 0.05–1.00 on the desktop profile (1.00 on Life, Today, Explore), lazy images of hidden screens downloaded (2–5 MB), layout 1.2–2.3 s on the mobile-like profile |
| P-02 | CRITICAL | Eight background films were requested on every entry, whichever screen was opened (`preload="auto"`, `src` on all of them). | 16–24 film requests per load, 8 different files |
| P-03 | HIGH | When the film host cannot be reached, the keep-alive logic asked again several times a second, without limit. | 147–165 film attempts in 2.5 s; 5,543 in 12 s when the request fails at once; the `load` event did not fire while requests were pending |
| P-04 | HIGH | Start-up blocks the main thread: 54 parser-blocking scripts, all eight screens built at DOMContentLoaded. | blocking time 81–279 ms desktop, 985–2,489 ms mobile-like |
| P-05 | MEDIUM | The 40 px header logo was a 634×634 px, 189 KB file. | 189 KB on every page |
| P-06 | MEDIUM | Topic photos: 42 JPEG files, 13.2 MB, up to 724 KB each, one size for every use. | Explore results: 17 images, 4.7 MB |
| P-07 | MEDIUM | Web fonts: 11 families requested in two render-blocking style sheets; 5 of them (including the Material Symbols icon font) are used by no style. | 3 font style-sheet requests per load |
| P-08 | MEDIUM | The GSAP script from a CDN blocked parsing. | 1 parser-blocking third-party script |
| P-09 | MEDIUM | 54 separate scripts (1,638 KB, 456 KB gzip) and 17 style sheets (635 KB, 108 KB gzip); no bundling. | 75–93 requests per load |
| P-10 | MEDIUM | Card photos drawn as CSS backgrounds load as soon as the screen is rendered, however far down they are. | Community: 19 images, 5.6 MB at entry |
| P-11 | MEDIUM | Switching the life stage decoded the new section's photos on the main thread before the frame was shown. | stage switch 120–272 ms on the desktop profile (plain run) |
| P-12 | MEDIUM | At 390 px with 200% text, text was cut off inside several cards (page-level overflow was already 0). | 31 kinds of element cut off (Home 19, Life 6, Community 5, Explore results 1) |
| P-13 | LOW | "Is this saved?" parsed the whole saved-items store once per card. | 331 parses per load; 37 ms with 200 saved items (desktop) |
| P-14 | LOW | The film inside the "connected menus" card was fetched when its screen opened, even when the card was far below the fold. | 1 extra film request on Today, Explore, My Life, Life |
| P-15 | LOW | `life-topics.json` (480 KB, 84 KB gzip) is requested with `cache: "no-cache"`, so it is revalidated on every visit. | 84.5 KB "not cached" on warm loads in the lab (the lab server does not answer 304) |
| P-16 | LOW | 92 of 110 images rendered at load have no `width`/`height` attributes; CSS reserves their space. | scroll CLS 0.000 |
| P-17 | LOW | The data repository is built three times per load (before the life topics arrive, after, and after the real-data layer reports). | 3 builds × 66 ms (Node, median) |
| P-18 | LOW | With "reduce motion" the film of the open screen is still downloaded (it is shown as a still frame). | 17 film requests before |
| P-19 | LOW | Admin and Data Manager: CLS 0.044–0.076, content appears after the 480 KB data file. | LCP 916–1,028 ms desktop |
| P-20 | MEDIUM | Interaction latency under 4× CPU slowdown is above 200 ms for most tasks. | 56–544 ms (median per task) |

Count before: CRITICAL 2 · HIGH 2 · MEDIUM 9 · LOW 7.

## Before and after

`before → after`. Lower is better everywhere.

### D. Desktop, cold (1440×900, no throttling, median of 3)

| Page | FCP ms | LCP ms | CLS | TBT ms | DCL ms | load ms | requests | transfer KB | images (n / KB) | third-party attempts |
|---|---|---|---|---|---|---|---|---|---|---|
| Home | 440 → 316 | 440 → 316 | 0.320 → 0.001 | 191 → 59 | 930 → 752 | 1208 → 806 | 89 → 78 | 5299 → 889 | 15 / 4598 → 2 / 183 | 28 → 4 |
| Life Stage | 488 → 352 | 488 → 352 | 1.000 → 0.001 | 200 → 133 | 1002 → 855 | 1225 → 864 | 84 → 82 | 3328 → 1669 | 10 / 2628 → 6 / 963 | 26 → 8 |
| Life topic | 412 → 344 | 1008 → 744 | 1.000 → 0.001 | 171 → 48 | 766 → 713 | 797 → 719 | 75 → 77 | 889 → 714 | 1 / 189 → 1 / 8 | 24 → 7 |
| Life events | 552 → 316 | 552 → 316 | 1.000 → 0.001 | 246 → 163 | 1003 → 896 | 1268 → 908 | 84 → 82 | 3328 → 1669 | 10 / 2628 → 6 / 963 | 30 → 8 |
| Today | 440 → 304 | 440 → 304 | 1.000 → 0.001 | 279 → 113 | 975 → 841 | 1314 → 854 | 82 → 84 | 3543 → 2480 | 8 / 2843 → 8 / 1774 | 21 → 4 |
| My Life | 392 → 264 | 392 → 264 | 0.052 → 0.001 | 81 → 26 | 785 → 736 | 902 → 742 | 75 → 77 | 889 → 714 | 1 / 189 → 1 / 8 | 24 → 8 |
| My Life settings | 412 → 272 | 412 → 272 | 1.000 → 0.001 | 122 → 20 | 796 → 744 | 941 → 749 | 75 → 77 | 889 → 714 | 1 / 189 → 1 / 8 | 24 → 8 |
| Explore | 424 → 336 | 424 → 336 | 1.000 → 0.001 | 205 → 84 | 877 → 793 | 1005 → 803 | 84 → 86 | 3368 → 2320 | 10 / 2668 → 10 / 1614 | 24 → 7 |
| Explore results | 588 → 400 | 588 → 400 | 1.000 → 0.001 | 183 → 183 | 1032 → 834 | 1286 → 842 | 91 → 93 | 5368 → 3483 | 17 / 4668 → 17 / 2777 | 31 → 7 |
| Community | 432 → 292 | 432 → 292 | 0.052 → 0.001 | 153 → 36 | 883 → 757 | 1113 → 764 | 93 → 83 | 6308 → 2001 | 19 / 5608 → 7 / 1295 | 27 → 4 |
| LIVON AI | 352 → 260 | 352 → 260 | 0.052 → 0.001 | 104 → 7 | 791 → 694 | 956 → 696 | 76 → 78 | 889 → 714 | 1 / 189 → 1 / 8 | 16 → 4 |
| Help | 508 → 312 | 592 → 768 | 0.320 → 0.001 | 93 → 37 | 826 → 728 | 895 → 733 | 75 → 77 | 889 → 714 | 1 / 189 → 1 / 8 | 21 → 5 |
| Help article | 468 → 280 | 468 → 740 | 0.320 → 0.001 | 92 → 16 | 789 → 707 | 941 → 712 | 75 → 77 | 889 → 714 | 1 / 189 → 1 / 8 | 21 → 5 |
| static /livon/life/ | 120 → 128 | 120 → 128 | 0.000 → 0.000 | 0 → 0 | 15 → 17 | 65 → 62 | 2 → 2 | 4 → 4 | 0 / 0 → 0 / 0 | 1 → 1 |
| static /livon/life/20s/ | 164 → 148 | 164 → 148 | 0.000 → 0.000 | 0 → 0 | 20 → 18 | 76 → 64 | 2 → 2 | 6 → 6 | 0 / 0 → 0 / 0 | 1 → 1 |
| static topic page | 140 → 196 | 140 → 196 | 0.000 → 0.000 | 0 → 0 | 18 → 27 | 70 → 74 | 2 → 2 | 5 → 5 | 0 / 0 → 0 / 0 | 1 → 1 |
| static event page | 120 → 128 | 120 → 128 | 0.000 → 0.000 | 0 → 0 | 20 → 18 | 66 → 66 | 2 → 2 | 4 → 4 | 0 / 0 → 0 / 0 | 1 → 1 |
| static /livon/help/ | 140 → 148 | 140 → 148 | 0.000 → 0.000 | 0 → 0 | 22 → 20 | 70 → 66 | 2 → 2 | 7 → 7 | 0 / 0 → 0 / 0 | 1 → 1 |
| static Help article | 124 → 128 | 124 → 128 | 0.000 → 0.000 | 0 → 0 | 18 → 19 | 65 → 66 | 2 → 2 | 4 → 4 | 0 / 0 → 0 / 0 | 1 → 1 |
| Admin | 80 → 84 | 916 → 920 | 0.044 → 0.044 | 87 → 69 | 82 → 99 | 701 → 734 | 23 → 23 | 282 → 282 | 0 / 0 → 0 / 0 | 0 → 0 |
| Admin content | 84 → 84 | 1028 → 916 | 0.044 → 0.044 | 112 → 81 | 96 → 97 | 782 → 702 | 23 → 23 | 282 → 282 | 0 / 0 → 0 / 0 | 0 → 0 |
| Data Manager | 80 → 76 | 924 → 916 | 0.044 → 0.044 | 0 → 0 | 74 → 79 | 740 → 734 | 18 → 18 | 238 → 238 | 0 / 0 → 0 / 0 | 0 → 0 |
| Data Manager explorer | 76 → 84 | 984 → 932 | 0.044 → 0.044 | 111 → 84 | 70 → 70 | 740 → 725 | 18 → 18 | 238 → 238 | 0 / 0 → 0 / 0 | 0 → 0 |

Notes on the desktop table:

- **LCP on film screens is the header text.** The film cannot be decoded in the lab (the host is unreachable and the stand-in is not the real file), and a video without a poster is not an LCP candidate until it has a frame. LCP for the film frame itself: **NOT MEASURED**.
- **Help, Help article, Explore results: LCP went up in the table, not in reality.** Before, the LCP element on the Help address was a Home heading (`h2.lv-hm-display`) painted during the unstyled flash described in P-01 — a wrong element that disappeared a moment later. After, it is the Help heading. The Help heading itself appeared at 772–1,002 ms before and 673–716 ms after (three runs each).
- Static pages, Admin and Data Manager were not changed; their differences are run-to-run noise.

### W. Desktop, warm (second visit, HTTP cache)

| Page | load ms | cached / requests | not cached KB | film attempts in 2.5 s (host unreachable) |
|---|---|---|---|---|
| Home | 750 → 389 | 79/89 → 76/78 | 2480.3 → 84.5 | 151 → 3 |
| Life Stage | 856 → 447 | 78/87 → 80/82 | 2104.9 → 84.5 | 153 → 3 |
| Life topic | 624 → 440 | 73/75 → 75/77 | 84.5 → 84.5 | 165 → 3 |
| Life events | 674 → 527 | 78/80 → 80/82 | 84.5 → 84.5 | 160 → 4 |
| Today | 883 → 577 | 80/82 → 82/84 | 84.5 → 84.5 | 158 → 4 |
| My Life | 671 → 316 | 76/85 → 75/77 | 2147.2 → 84.5 | 155 → 3 |
| My Life settings | 498 → 369 | 73/75 → 75/77 | 84.5 → 84.5 | 165 → 4 |
| Explore | 885 → 470 | 82/84 → 84/86 | 84.5 → 84.5 | 156 → 3 |
| Explore results | 638 → 838 | 86/88 → 88/90 | 84.5 → 84.5 | 155 → 4 |
| Community | 894 → 354 | 91/93 → 81/83 | 84.5 → 84.5 | 147 → 3 |
| LIVON AI | 545 → 325 | 73/76 → 75/78 | 84.6 → 84.6 | 164 → 4 |
| Help | 493 → 292 | 73/75 → 75/77 | 84.5 → 84.5 | 165 → 3 |
| Help article | 484 → 280 | 73/75 → 75/77 | 84.5 → 84.5 | 165 → 3 |
| static /livon/life/ | 13 → 13 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| static /livon/life/20s/ | 19 → 24 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| static topic page | 12 → 18 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| static event page | 17 → 13 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| static /livon/help/ | 12 → 16 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| static Help article | 18 → 14 | 2/2 → 2/2 | 0.0 → 0.0 | 0 → 0 |
| Admin | 76 → 82 | 21/23 → 21/23 | 84.3 → 84.3 | 0 → 0 |
| Admin content | 81 → 91 | 21/23 → 21/23 | 84.3 → 84.3 | 0 → 0 |
| Data Manager | 87 → 88 | 17/18 → 17/18 | 84.3 → 84.3 | 0 → 0 |
| Data Manager explorer | 78 → 74 | 17/18 → 17/18 | 84.3 → 84.3 | 0 → 0 |

### M. Mobile-like (390×844, Fast 4G 9 Mbps / 1.5 Mbps / 60 ms, 4× CPU, median of 3)

| Page | FCP ms | LCP ms | CLS | blocking to load+1 s ms | idle warm-up tasks ms | DCL ms | load ms | script ms | layout ms | longest task ms | transfer KB | warm load ms |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Home | 732 → 716 | 1672 → 968 | 0.289 → 0.005 | 2351 → 797 (-66%) | 129, 99, 65, 64 | 3448 → 1831 | 6052 → 2371 | 1091 → 905 | 1681 → 692 | 859 → 564 | 2903 → 889 | 3616 → 1594 |
| Life Stage | 1316 → 520 | 2276 → 908 | 1.005 → 0.005 | 2344 → 1333 (-43%) | 302, 128, 57 | 3970 → 2314 | 4145 → 2370 | 828 → 909 | 2311 → 1207 | 1241 → 1064 | 1445 → 1086 | 4181 → 2143 |
| Life topic | 624 → 604 | 4296 → 2300 | 1.005 → 0.005 | 1311 → 807 (-38%) | 196, 163 | 2945 → 1499 | 4292 → 1503 | 919 → 765 | 1520 → 667 | 1440 → 648 | 3784 → 714 | 2722 → 1965 |
| Today | 928 → 508 | 2156 → 896 | 1.005 → 0.005 | 2489 → 1596 (-36%) | 303, 122, 79 | 3619 → 2190 | 5174 → 2238 | 923 → 844 | 2100 → 1392 | 1102 → 874 | 4632 → 1279 | 4057 → 2439 |
| My Life | 812 → 608 | 1572 → 864 | 1.005 → 0.005 | 985 → 322 (-67%) | 282, 154, 52 | 2302 → 1526 | 2388 → 1551 | 856 → 796 | 938 → 349 | 501 → 282 | 889 → 714 | 3188 → 1074 |
| Explore | 588 → 564 | 2412 → 1432 | 1.005 → 0.005 | 2395 → 1030 (-57%) | 244, 184, 52 | 3633 → 2162 | 4015 → 2244 | 948 → 806 | 1820 → 1069 | 780 → 703 | 2781 → 1571 | 3394 → 1825 |
| Explore results | 712 → 556 | 712 → 1332 | 1.005 → 0.005 | 2364 → 1427 (-40%) | 255, 184, 86 | 3675 → 2239 | 4117 → 2352 | 861 → 835 | 2188 → 1231 | 808 → 552 | 2678 → 2083 | 3220 → 2126 |
| Community | 660 → 504 | 1596 → 1116 | 0.105 → 0.005 | 1956 → 750 (-62%) | 225, 118, 56 | 2916 → 1855 | 6423 → 2396 | 1122 → 775 | 1236 → 733 | 794 → 554 | 6073 → 2001 | 4159 → 1404 |
| LIVON AI | 892 → 500 | 2552 → 1044 | 1.005 → 0.005 | 2041 → 419 (-79%) | 285, 126, 60 | 3300 → 1400 | 4631 → 1428 | 1133 → 965 | 1564 → 429 | 799 → 382 | 2195 → 714 | 3597 → 1126 |
| Help | 588 → 560 | 3272 → 1632 | 0.289 → 0.005 | 2175 → 485 (-78%) | 282, 129, 76 | 3233 → 1590 | 4430 → 1612 | 966 → 1141 | 1508 → 485 | 892 → 283 | 1721 → 714 | 3156 → 1140 |
| Help article | 844 → 800 | 3088 → 1436 | 0.289 → 0.005 | 1248 → 134 (-89%) | 345, 147, 64 | 3038 → 1406 | 3747 → 1426 | 844 → 1122 | 1338 → 341 | 396 → 345 | 2195 → 714 | 3404 → 916 |
| static /livon/life/20s/ | 536 → 488 | 536 → 488 | 0.000 → 0.000 | 0 → 0 (—) | — | 119 → 120 | 479 → 174 | 3 → 3 | 307 → 272 | 362 → 280 | 6 → 6 | 56 → 41 |
| static topic page | 460 → 416 | 460 → 416 | 0.000 → 0.000 | 0 → 0 (—) | — | 126 → 113 | 184 → 184 | 5 → 3 | 236 → 210 | 258 → 221 | 5 → 5 | 49 → 59 |
| Admin | 232 → 216 | 2384 → 2168 | 0.076 → 0.076 | 690 → 553 (-20%) | — | 280 → 273 | 1424 → 1379 | 36 → 40 | 92 → 78 | 728 → 568 | 282 → 282 | 262 → 203 |
| Data Manager | 232 → 208 | 2336 → 2084 | 0.076 → 0.076 | 52 → 40 (-23%) | — | 244 → 209 | 1368 → 1333 | 28 → 19 | 109 → 92 | 102 → 99 | 238 → 238 | 171 → 182 |

Notes on the mobile-like table:

- "blocking to load+1 s" is the blocking time of the start-up itself. The idle warm-up (see *JavaScript*) runs after that, in separate tasks whose sizes are listed in the next column; an input that arrives during one of them waits for it to finish.
- Start-up blocking is lower on every screen (−36% to −89%) and **still above 600 ms on Home, Life, Life topic, Today, Explore, Explore results and Community** (750–1,596 ms). That is finding P-04, now MEDIUM, see *Known limitations*.
- LCP is at or below 2.5 s on every measured page in this profile (it was up to 4.3 s).

### X. Desktop runtime counters at load (CDP)

| Page | script ms | layout ms | style ms | DOM elements | listeners | JS heap MB |
|---|---|---|---|---|---|---|
| Home | 192 → 200 | 380 → 128 | 95 → 52 | 8870 → 8870 | 654 → 664 | 6.1 → 5.4 |
| Life Stage | 193 → 185 | 446 → 261 | 78 → 72 | 8870 → 8870 | 656 → 673 | 4.8 → 5.5 |
| Life topic | 181 → 192 | 226 → 163 | 64 → 53 | 9304 → 9304 | 654 → 664 | 4.8 → 5.6 |
| Life events | 184 → 188 | 451 → 262 | 76 → 57 | 8870 → 8870 | 654 → 673 | 4.7 → 5.6 |
| Today | 205 → 201 | 403 → 212 | 70 → 57 | 8870 → 8870 | 654 → 663 | 4.8 → 5.9 |
| My Life | 174 → 192 | 228 → 106 | 44 → 40 | 8870 → 8870 | 654 → 673 | 4.7 → 4.9 |
| My Life settings | 188 → 178 | 229 → 95 | 56 → 44 | 9011 → 9011 | 654 → 673 | 4.8 → 4.9 |
| Explore | 191 → 189 | 336 → 339 | 71 → 70 | 8870 → 8870 | 654 → 672 | 4.7 → 8.6 |
| Explore results | 192 → 206 | 520 → 443 | 90 → 64 | 9233 → 9233 | 654 → 672 | 5.1 → 8.9 |
| Community | 194 → 188 | 244 → 126 | 73 → 70 | 8870 → 8870 | 654 → 672 | 4.7 → 7.1 |
| LIVON AI | 209 → 198 | 115 → 82 | 58 → 48 | 8871 → 8871 | 654 → 672 | 4.7 → 7.2 |
| Help | 199 → 256 | 250 → 90 | 58 → 44 | 9038 → 9038 | 654 → 673 | 4.7 → 9.9 |
| Help article | 184 → 245 | 266 → 77 | 47 → 45 | 8903 → 8903 | 654 → 673 | 4.7 → 7.9 |
| static /livon/life/ | 1 → 1 | 32 → 41 | 1 → 1 | 105 → 105 | 0 → 0 | 1.1 → 1.1 |
| static /livon/life/20s/ | 1 → 1 | 66 → 54 | 2 → 2 | 338 → 338 | 0 → 0 | 1.1 → 1.1 |
| static topic page | 1 → 1 | 46 → 79 | 1 → 2 | 153 → 153 | 0 → 0 | 1.1 → 1.1 |
| static event page | 1 → 1 | 32 → 37 | 1 → 1 | 104 → 104 | 0 → 0 | 1.1 → 1.1 |
| static /livon/help/ | 1 → 1 | 47 → 55 | 1 → 2 | 205 → 205 | 0 → 0 | 1.1 → 1.1 |
| static Help article | 1 → 1 | 31 → 35 | 1 → 1 | 75 → 75 | 0 → 0 | 1.1 → 1.1 |
| Admin | 8 → 9 | 15 → 15 | 2 → 2 | 283 → 283 | 33 → 33 | 5.4 → 4.8 |
| Admin content | 10 → 8 | 40 → 34 | 5 → 5 | 1110 → 1110 | 34 → 34 | 5.3 → 4.6 |
| Data Manager | 5 → 5 | 19 → 22 | 2 → 2 | 354 → 354 | 32 → 32 | 5.1 → 5.9 |
| Data Manager explorer | 5 → 5 | 36 → 39 | 5 → 4 | 1208 → 1208 | 33 → 33 | 5.2 → 4.5 |

### User tasks (interaction latency, lab stand-in for INP)

| Task | worst interaction, desktop — median of 5 (range) | worst interaction, 4× CPU — median of 3 (range) | longest task, desktop (median) | longest task, 4× CPU (median) |
|---|---|---|---|---|
| T1 Home: search | 24 (16–312) → 24 (16–352) | 64 (56–984) → 64 (56–72) | 224 → 238 | 937 → 1015 |
| T2 Life: switch stage → topic → detail | 256 (232–272) → 240 (200–376) | 384 (248–432) → 416 (416–488) | 189 → 182 | 820 → 1024 |
| T3 Explore: search → filter → detail | 120 (112–128) → 112 (112–200) | 312 (304–328) → 344 (304–408) | 85 → 127 | 354 → 407 |
| T4 Community: search → post → comment → like | 152 (120–168) → 136 (128–168) | 544 (496–608) → 416 (392–704) | 202 → 111 | 573 → 516 |
| T5 Community: write a post | 136 (120–152) → 128 (120–136) | 480 (472–648) → 576 (528–640) | 137 → 101 | 649 → 525 |
| T6 Help: search → article → related | 16 (16–112) → 16 (16–88) | 56 (48–528) → 280 (280–280) | 91 → 0 | 412 → 201 |
| T7 My Life: add a todo → settings | 64 (56–72) → 64 (56–72) | 184 (160–216) → 240 (200–256) | 59 → 0 | 297 → 189 |
| T8 switch screens with the header links | 80 (64–80) → 80 (72–88) | 88 (64–88) → 88 (72–96) | 215 → 270 | 1001 → 1091 |

- T8 switches six screens with the header links; the harness could not click the seventh link (Home) in either build.
- On the desktop profile the median of every task except T2 is at or below 200 ms. T2 (Life: switch the stage, open a topic, open a detail) is 256 → 240 ms in this harness (an earlier run of the same five repetitions gave 216 ms), which keeps the DevTools heap and performance domains enabled; in a plain run without them the stage switch took 120–272 ms before (median 192) and 128–192 ms after (median 148), six runs each. Either way it is at the 200 ms line, not clearly under it.
- T6 (Help) under 4× CPU went from 56 to 280 ms (median). The first key press of that task comes about 1.2 s after load, which is when the idle warm-up of the other screens begins, and it waits for one of those tasks. Before, the same work ran before `load` (which came 1.6 s later on that screen). See *Known limitations*, item 5.
- Under 4× CPU slowdown most tasks are above 200 ms in both builds. This phase did not change that (P-20).

| Route (hash change → next frame, ms) | first open, desktop | repeat, desktop | first open, 4× CPU | repeat, 4× CPU |
|---|---|---|---|---|
| `#life` | 307 → 343 | 232 → 238 | 1228 → 1544 | 978 → 1024 |
| `#life/20s/first-job` | 143 → 112 | 97 → 101 | 373 → 369 | 445 → 366 |
| `#today` | 202 → 214 | 195 → 196 | 1045 → 1145 | 963 → 858 |
| `#explore` | 164 → 147 | 202 → 209 | 671 → 812 | 960 → 968 |
| `#ex-results?q=취업` | 125 → 164 | 79 → 123 | 457 → 589 | 426 → 445 |
| `#community` | 324 → 375 | 163 → 267 | 779 → 790 | 808 → 860 |
| `#life-now` | 87 → 85 | 104 → 82 | 220 → 348 | 245 → 380 |
| `#ml-settings` | 43 → 60 | 34 → 58 | 190 → 231 | 228 → 281 |
| `#help` | 54 → 81 | 64 → 68 | 258 → 268 | 240 → 271 |
| `#help/a/no-signup` | 36 → 38 | 36 → 32 | 122 → 94 | 104 → 153 |
| `#ai-chat` | 73 → 77 | 77 → 59 | 345 → 308 | 287 → 339 |
| `#livon-home` | 120 → 145 | 112 → 119 | 512 → 625 | 626 → 701 |

The first open of a screen that has not started yet now includes that screen's start-up (in this measurement the routes are changed one after another, so the idle warm-up never gets a quiet moment and every first open is an on-demand start). That is visible under 4× CPU — Life 1,228 → 1,544 ms, My Life 220 → 348 ms, Explore 671 → 812 ms — and small on the desktop profile (measured separately 300 ms after load: Life 316 → 365 ms, Today 250 → 320 ms, My Life 60 → 125 ms, the others within noise). Repeat opens show no consistent direction; their run-to-run variation in this lab is about ±30%.

## Audit after

| ID | Before | After | What was done | Evidence (after) |
|---|---|---|---|---|
| P-01 | CRITICAL | fixed | The page's `<style>` block moved into `<head>`. | CLS 0.001 desktop, 0.005 mobile-like, on every app view; scroll CLS 0.000 |
| P-02 | CRITICAL | fixed | Films keep their address in `data-src`; `livon/livon-media.js` gives a film its `src` when its screen is showing (header films) or when it is near the viewport (cards). | 1 film request per entry (2 on Life and My Life, where a second film is in view) |
| P-03 | HIGH | fixed | After two errors a film is detached; it is tried again when the browser is back online or the screen is opened again. | 3–4 attempts in 2.5 s; 2 in 12 s; `load` fires |
| P-04 | HIGH | MEDIUM | Styles in the head (no layout of hidden screens), on-demand screen start-up (`livon/livon-boot.js`), lazy search index, cheaper text cleaning, asynchronous GSAP. | blocking 7–183 ms desktop; 134–1,596 ms mobile-like (was 985–2,489) |
| P-05 | MEDIUM | fixed | A 120×120 px copy of the logo (8.5 KB) is used in the header; the original file is kept. | 189 KB → 8.5 KB |
| P-06 | MEDIUM | MEDIUM | The 42 photos were re-encoded (quality 88, 4:4:4, progressive): 13.2 MB → 8.9 MB, largest 724 KB → 530 KB, median PSNR 42 dB, checked by eye. Sizes per use (responsive variants) were not made. | Explore results: 17 images, 2.8 MB |
| P-07 | MEDIUM | LOW | Five unused families and one style-sheet request removed. The remaining font style sheets are still render-blocking third-party requests. | 2 font style-sheet requests; effect on real paint times **NOT MEASURED** (host unreachable in the lab) |
| P-08 | MEDIUM | fixed | `async` on the GSAP script (its only caller already checks `window.gsap`). | 0 parser-blocking third-party scripts |
| P-09 | MEDIUM | MEDIUM | Not changed: bundling needs a build step for LIVON scripts, which is an architecture change outside this phase. Two small scripts were added. | 56 scripts (1,654 KB, 461 KB gzip), 17 style sheets |
| P-10 | MEDIUM | fixed | Background photos in Community and Home cards are written as `data-lv-bg` and applied when the card is within 600 px of the viewport. | Community 19 → 7 images at entry (5.6 → 1.3 MB); Home 15 → 2 (4.6 MB → 183 KB) |
| P-11 | MEDIUM | fixed | `decoding="async"` on photos rendered by Life, Explore and Community. | stage switch 120–272 → 128–192 ms (plain run) |
| P-12 | MEDIUM | fixed | Grid and flex children may shrink, long words may wrap, card grids fall back to one column. | 0 kinds cut off; page overflow 0 on 12 views |
| P-13 | LOW | fixed | `LivonPlatform.hasSave(id)` answers from an id index rebuilt only when the stored text changes. | 331 checks: 37 ms → 0.5 ms with 200 saved items |
| P-14 | LOW | fixed | The card film gets its `src` when the card is seen. | 0 extra film requests at entry |
| P-15 | LOW | LOW | Not changed (the freshness of this file was chosen on purpose). | on GitHub Pages a 304 is expected: **NOT MEASURED** |
| P-16 | LOW | LOW | Not changed; images in the page itself all have dimensions. | scroll CLS 0.000 |
| P-17 | LOW | LOW | Each build is cheaper; the number of builds is unchanged. | 3 builds × 30 ms (Node, median; was 66 ms) |
| P-18 | LOW | LOW | Fewer films: only the open screen's. | 1 film request (was 17) |
| P-19 | LOW | LOW | Not changed. | unchanged |
| P-20 | MEDIUM | MEDIUM | Not changed, apart from the Life stage switch and Help. | 64–576 ms (median per task) |

Count after: CRITICAL 0 · HIGH 0 · MEDIUM 4 (P-04, P-06, P-09, P-20) · LOW 6 (P-07, P-15, P-16, P-17, P-18, P-19) · fixed 10.

## JavaScript

| | Before | After |
|---|---|---|
| Local scripts on the app page | 54 | 56 (+ `livon-media.js`, `livon-boot.js`) |
| Size, uncompressed / gzip | 1,638 KB / 456 KB | 1,654 KB / 461 KB |
| Parser-blocking third-party scripts | 1 (GSAP) | 0 |
| Largest script | `life-now-page.js` 135 KB | same |
| Screens built at DOMContentLoaded | 8 | 1 (the one that is showing) |

**On-demand start-up (`livon/livon-boot.js`).** Each screen module registers with `LivonBoot.view(name, start)`. The screen that is showing starts at DOMContentLoaded, exactly as before. Every other screen starts when it is opened (the scheduler's `hashchange` listener is registered before the router's, so a screen is ready before it is shown), when another module asks for it (`LivonBoot.ensure`), or in idle time: one screen per `requestIdleCallback`, starting 1.2 s after `load`. The warm-up waits for 1.5 s after any key press, pointer press, wheel, touch or screen change, so it does not compete with someone who is using the page. Layers every screen depends on (platform, onboarding, personalization, Life hub, Help, accessibility) still start at DOMContentLoaded. If `livon-boot.js` is missing, every module starts at DOMContentLoaded as before.

The inline scripts of `livon/index.html` were not edited (their hashes are pinned in the CSP of `vercel.json`).

Dead code: `livon/life-app.js` is not loaded by the app page (already recorded as LEGACY in the storage inventory); it was left in place. No other unreferenced LIVON script was found. No source maps are published.

## CSS

17 style sheets, 637 KB (108 KB gzip); the largest are `styles.css` (104 KB, shared with the rest of the site), `life-page.css` (81 KB) and `home-lifestage.css` (68 KB). All are render-blocking and all are needed for the first paint of some screen; they were not merged or split (P-09). The one change with a measurable effect was moving the page's inline `<style>` (38 KB) from the end of `<main>` into `<head>`.

`content-visibility: auto` was tried on the long screens and rejected: in-page anchor jumps landed up to 4,198 px away from their target.

## Images

| | Before | After |
|---|---|---|
| Topic photos (42 JPEG, 1152×864) | 13.2 MB, largest 724 KB | 8.9 MB, largest 530 KB |
| Header logo | 634×634, 189 KB | 120×120, 8.5 KB |
| Images at entry, Home (desktop) | 15 / 4.6 MB | 2 / 183 KB |
| Images at entry, Community (desktop) | 19 / 5.6 MB | 7 / 1.3 MB |
| Images at entry, Explore results (desktop) | 17 / 4.7 MB | 17 / 2.8 MB |
| `<img>` in the page with `width` and `height` | 6 of 6 | 6 of 6 |
| Image templates in JS that are lazy or decoded off the main thread | 10 of 12 | 12 of 12 |

Not done: a second, smaller size of each photo with `srcset` (P-06). Format conversion (WebP/AVIF) was not done either: it needs a fallback path in every template and a visual check per photo.

## Video

Eight background films, all on a third-party host that the lab cannot reach. File sizes and real loading behaviour of the films: **NOT MEASURED**.

| | Before | After |
|---|---|---|
| Films requested at entry | 8 different files (16–24 requests) | 1 (the open screen's) |
| `preload` | `auto` on 7, `metadata` on cards | `none` on all |
| Host unreachable, attempts in 2.5 s | 147–165 | 3–4 |
| Host unreachable, attempts in 12 s | 5,543 | 2 |
| "Reduce motion" | 17 requests | 1 request; the film is held on a still frame (`playbackRate = 0`), the pause control works as before |

The films themselves were not removed, re-encoded or replaced.

## Fonts

Requested families 11 → 6 (removed: Geist, UnifrakturCook, Instrument Sans, Inter, Material Symbols Outlined — none is used by any style). Font style-sheet links 2 → 1; `display=swap` kept. Still present: an `@import` of a Google Fonts style sheet inside the page style, one `@font-face` from `fonts.cdnfonts.com` and three files from `db.onlinewebfonts.com` on Life, Explore and My Life. Because none of these hosts is reachable from the lab, the cost of font loading and the amount of text re-layout after fonts arrive are **NOT MEASURED**.

## Data Platform

| | Before | After |
|---|---|---|
| Repository build, 530 entities (Node, median of 15) | 65.9 ms | 30.4 ms |
| Builds per page load | 3 | 3 |
| First search after a build (browser, desktop) | 7.6 ms | 12.7 ms |

The search index of an entity is now built the first time a search needs it instead of while loading, and `cleanText` skips the tag/entity/control-character passes for strings that contain none of those characters (the results are identical; `PERF-26` compares both paths). The cost that moved to the first search is about 5 ms on the desktop profile.

## Search

| | Before | After |
|---|---|---|
| Repository search, 10 queries, warm (desktop, mean of 20) | 0.3–3.2 ms | 0.4–2.5 ms |
| Help search, 24 queries (desktop, median / slowest) | 0.49 / 0.92 ms | 0.80 / 1.17 ms |
| Help search under 4× CPU (median / slowest) | 2.55 / 4.63 ms | 2.64 / 4.52 ms |
| Typing in the Explore search field | no interaction above the 16 ms reporting threshold | same |

Personalization (For You ordering) is part of the Community and Today timings below; it was not changed.

## Community

Milliseconds from the route change to the next frame, `before → after`.

| Profile | posts | cards | DOM elements | latest | for you | search | filter | detail (40 comments) | back to feed |
|---|---|---|---|---|---|---|---|---|---|
| desktop | 0 | 0 | 862 | 97 → 81 | 106 → 85 | 60 → 58 | 54 → 60 | 57 → 48 | 80 → 64 |
| desktop | 30 | 20 | 1073 | 113 → 91 | 119 → 122 | 74 → 76 | 70 → 59 | 119 → 101 | 110 → 95 |
| desktop | 300 | 20 | 1073 | 92 → 124 | 191 → 92 | 89 → 99 | 68 → 124 | 116 → 142 | 91 → 87 |
| 4× CPU | 0 | 0 | 862 | 396 → 386 | 491 → 323 | 380 → 298 | 389 → 294 | 386 → 337 | 498 → 371 |
| 4× CPU | 30 | 20 | 1073 | 449 → 464 | 577 → 221 | 403 → 374 | 356 → 295 | 525 → 634 | 424 → 466 |
| 4× CPU | 300 | 20 | 1073 | 450 → 416 | 507 → 300 | 371 → 450 | 413 → 440 | 684 → 660 | 494 → 519 |

The feed renders one page of cards (10 at a time, 20 shown in the fixture after one "more") whatever the number of posts, so the DOM does not grow with the store. Storage reads per route change: 133–145 `getItem` calls in both builds; with the id index they no longer parse the saved-items store per card.

## My Life

Milliseconds from the route change to the next frame, `before → after`. 300 saved items were written; the store keeps 200.

| Profile | data | todos view | saved view | home | settings | DOM elements (todos / saved view) |
|---|---|---|---|---|---|---|
| desktop | empty | 40 → 38 | 45 → 48 | 32 → 26 | 130 → 61 | 256 / 240 |
| desktop | 200 todos + 200 saved | 176 → 207 | 293 → 233 | 41 → 43 | 124 → 41 | 2230 / 2145 |
| 4× CPU | empty | 143 → 217 | 152 → 172 | 86 → 115 | 398 → 270 | 256 / 240 |
| 4× CPU | 200 todos + 200 saved | 834 → 989 | 1087 → 1116 | 176 → 185 | 395 → 328 | 2230 / 2145 |

The todo and saved lists render every item (about 2,200 elements for 200 items). That is the largest remaining large-data cost and was not changed in this phase (no list windowing).

## Help

68 articles. Search stays below 5 ms per query in both profiles (see *Search*). Help is the lightest app screen: start-up blocking 37 ms desktop, 485 ms mobile-like (was 2,175 ms). Help works offline once the page is loaded.

## Admin

Not changed. Desktop: load 701–782 ms, 23 requests, 282 KB, view changes 5–28 ms. Mobile-like: blocking 553–690 ms, LCP 2.1–2.4 s (the content waits for the 480 KB data file). Admin loads no public screen module, no film and no web font; the public app loads no Admin file.

## Data Manager

Not changed. Model build over 530 records: 83 ms before, 81 ms after (median of 5, desktop). View changes 3–64 ms. 18 requests, 239 KB.

## Storage

| | Before | After |
|---|---|---|
| `localStorage.getItem` calls during load (8 app views) | 635–727 | 597–808 |
| `localStorage.setItem` calls during load | 10 | 10 |
| Time inside `getItem` during load | 1–2 ms | 1–2 ms |
| Per-card "is this saved?" checks that parse the whole store | 331 | 0 (the id index is rebuilt only when the stored text changes) |

The two new scripts store nothing; the storage inventory (`livon/data/livon-user-data.js`) is unchanged.

## DOM

The document holds all eight screens: 8,870–9,304 elements (unchanged). Only the open screen is laid out. Today is 50,220 px tall at 390 px wide and Life 35,555 px; laying out those two screens is the largest part of what is left of P-04.

## Event listeners

| Sequence | Listeners | DOM nodes (including detached) | JS heap MB |
|---|---|---|---|
| 80 route changes (8 screens × 10) (start → half → end) | 664 → 664 → 664 | 20590 → 20120 → 20170 | 5.70 → 5.78 → 5.82 |
| 20 × open a post and go back (start → half → end) | 664 → 664 → 664 | 20180 → 21129 → 21154 | 5.82 → 5.91 → 5.92 |
| 20 × open a Help article and go back (start → half → end) | 664 → 664 → 664 | 21141 → 21155 → 21168 | 5.92 → 5.92 → 5.93 |
| 20 × open and close the composer (start → half → end) | 664 → 669 → 669 | 21192 → 22018 → 22075 | 5.93 → 7.44 → 7.46 |

No growth with repeated route changes, post or article opens. The composer adds 5 listeners the first time it is opened and none after that. Scroll listeners: four (`site-chrome.js` header state, Explore results scroll memory with a debounce, the Community call-to-action, the LIVON AI message list); the three on `window` are passive. No resize handlers. Timers: the sync engine (60 s) and the film keep-alive (500 ms per hero film, existing behaviour; it no longer causes requests when a film cannot be loaded).

## Network

Requests at entry (desktop, own origin / third-party attempts): Home 81 / 21 → 78 / 4, Life 80 / 24 → 82 / 8, Today 82 / 24 → 86 / 5, Explore 89 / 31 → 86 / 7, Community 93 / 25 → 83 / 4, My Life 80 / 30 → 77 / 7, LIVON AI 76 / 20 → 78 / 5, Help 80 / 28 → 77 / 5.

Third-party hosts contacted, after: `fonts.googleapis.com` (2), `cdn.jsdelivr.net` (1, GSAP), the film host (1–2), `db.onlinewebfonts.com` (3, on Life, Explore, My Life). No new host was added. Requests other than GET: none. Data requests at start-up, in both builds: `life-topics.json` and a same-origin status probe (`/api/livon/data?action=status`); LIVON AI also asks `/api/health`. No request goes to Firebase, an account service, an AI provider or a public-data provider at start-up. `newon-auth-firebase.js` is a local adapter file that is loaded but makes no request without configuration.

Resource hints: `preconnect` to the two Google Fonts hosts (unchanged). No `preload` was added: the film is the only large above-the-fold resource and it is on a host the lab cannot reach, so the effect could not be checked.

Cache busting: every local script and style sheet carries a `?v=` version; every file changed in this phase got `?v=20261002perf1`. Images are not versioned: the re-encoded photos keep their names, so a browser that already has a photo keeps it until its cache entry expires (10 minutes on the production host). Production cache headers were not touched.

## Offline

After the page has loaded, with the network off: every screen opens (30–238 ms on the desktop profile), Help search and articles work, local features (todos, saved items, Community drafts) work, no script error, the `load` event had fired. The only failed requests are photos that had not been loaded yet (30; 37 before) — no retry loop. There is no service worker, so a first visit offline cannot work; that is unchanged.

## Responsive

Widths 320, 390, 768, 1024 and 1440: page-level horizontal overflow 0 on every view before and after; the accessibility audit of the previous phase was repeated at all five widths with the same result (see *Regression checks*).

## 390px + 200% text

Re-investigated as requested. Page-level overflow was already 0 on all 12 views; what remained was text cut off inside cards whose grid or flex children could not shrink. Fixed in `livon/livon-a11y.css` (children may shrink, long words may wrap) and in three card grids (`minmax(min(100%, …), 1fr)`).

| | Before | After |
|---|---|---|
| Views with page-level overflow | 0 of 12 | 0 of 12 |
| Kinds of element cut off by an ancestor | 31 (Home 19, Life 6, Community 5, Explore results 1) | 0 |

The LIVON AI conversation list is an off-canvas drawer (closed by default) and is not counted. Method: viewport 390×844, `html { font-size: 200% }`; this is text enlargement by root font size, not browser zoom, and not a real device.

## Performance budget

Set a little above the measured state so that growth fails the build (`scripts/livon-performance-quality.mjs`, `BUDGET`):

| Budget | Limit | Now |
|---|---|---|
| Local scripts on the app page | 60 | 56 |
| App scripts, uncompressed | 1,850 KB | 1,654 KB |
| One script | 160 KB | 135 KB |
| Style sheets on the app page | 18 | 17 |
| App style sheets, uncompressed | 700 KB | 637 KB |
| One style sheet | 120 KB | 104 KB |
| `livon/index.html` | 240 KB | 215 KB |
| Inline `<style>` | 48 KB | 38 KB |
| One image under `livon/assets` | 600 KB | 530 KB |
| All topic photos | 10 MB | 8.9 MB |
| Header logo | 20 KB | 8.5 KB |
| One static page | 40 KB | 10–24 KB |
| `livon/seo.css` | 12 KB | 6.7 KB |
| Script tags on an Admin page | 24 | 6 (Admin), 2 (Data Manager) |

Lab targets kept by browser tests (`tests/livon/performance.test.mjs`): CLS ≤ 0.1 on six views, one film request per entry, at most 8 film requests in 3.5 s with the host unreachable, page overflow 0 at 390 px with 200% text, 300 posts → one page of cards.

## Quality script

`node scripts/livon-performance-quality.mjs [--root _publish]` — deterministic, no browser. It runs in the build after the accessibility check and fails the build on any error. It checks: page styles in the head; every film on `data-src` with `preload="none"`; no `<source src>`; the loader and scheduler present and ahead of the screen modules and the router; no parser-blocking third-party script; no script loaded twice; requested web fonts are used; the budgets above; dimensions or lazy loading on images; every screen module registered with the scheduler; no Admin file in the public app and no public screen module in Admin; static pages with no script, only `seo.css`, inside the size budget; no source maps.

It reports no timing. Result on this branch: 0 errors, 1 warning (`/theme-shell.js` is a small parser-blocking script in the head, shared with the rest of the site and left as it is).

## Regression checks

Run on the final state of this branch.

| Check | Result |
|---|---|
| `node --test tests/livon/*.test.mjs` | 957 tests, 0 failures (897 existing + 60 new PERF tests); tests that need a browser are skipped where no local Chromium is available |
| `livon-performance-quality.mjs` | 0 errors, 1 warning |
| `livon-accessibility-quality.mjs` | 0 errors, 0 warnings, 44 manual-review notes (same as the previous phase) |
| `livon-seo-quality.mjs` (in the build) | 0 errors; 125 static pages, 126 indexable URLs, as before |
| Accessibility audit in the browser, 21 app views × 5 widths (320, 390, 768, 1024, 1440) | 0 findings; page overflow 0; no script error |
| Accessibility audit, static pages and Admin × 5 widths | identical to the previous phase |
| Keyboard tasks (9 tasks at 390 and 1440: onboarding, Life, Explore, Community write/edit, search/comment/save, report/delete, Help, My Life preferences, LIVON AI) | 9 / 9 pass at both widths |
| Tab walk at 320, 768, 1440 | no missing focus indicator, no covered or off-screen focus, no back-jump |
| Forced colours, text spacing, 200% text at 1280 | identical to the previous phase |
| Contrast sweep, 25 views | 0 failures |
| 390 px + 200% text | page overflow 0 on 12 views, 0 cut-off kinds |
| Visual comparison before/after, 12 views × 5 widths (full page, pixel difference above a threshold) | 0.000–0.002% except the header logo (new 120 px file) and photos still decoding when the screenshot was taken (Today at 768 px; the same photos are painted when scrolled into view) |
| Films | play on the open screen; the pause control and "reduce motion" behave as before |
| Onboarding, Help, Community, Explore, My Life flows | covered by the keyboard tasks above and by the existing suites |

## Build output

`node scripts/publish-site.mjs` on this branch: OK. In the build, `livon-seo-quality` 0 errors, `livon-accessibility-quality` 0 errors, `livon-performance-quality` 0 errors (1 warning).

| | Value |
|---|---|
| Output | 227 MB, 3,153 files (the largest files belong to other parts of the site: a 6.8 MB `.wasm`, PDFs) |
| `livon/` in the output | 16 MB, 438 files (it was 20 MB before the photos were re-encoded) |
| Static LIVON pages | 125 content pages, 10–24 KB each, plus redirect stubs; no script, `seo.css` only (6.7 KB) |
| Source maps | none |
| Byte-identical JS or CSS under `livon/` | none |
| Admin | not published (unchanged) |
| New files in the output | `livon/livon-media.js` (6.9 KB), `livon/livon-boot.js` (4.9 KB), `assets/livon-mark-icon-120.jpg` (8.5 KB) |

There is no minification or bundling step for LIVON scripts and styles; files are published as written and compressed by the host (gzip). That is unchanged (P-09).

## Known limitations

1. **Lab only.** One machine, one browser engine (Chromium), localhost. Field data: **NOT MEASURED**. Lighthouse was not run. Safari, Firefox and real phones: **NOT MEASURED**.
2. **The mobile-like profile is an emulation** (network shaping and CPU slowdown on a cloud VM), not a phone. Its absolute numbers are useful for before/after comparison only.
3. **Films and web fonts** are on hosts the lab cannot reach. Film sizes, film LCP, font loading and font swap: **NOT MEASURED**.
4. **P-04 is reduced, not removed.** Start-up blocking on the mobile-like profile is 0.75–1.6 s on Home, Life, Today, Explore and Community. What is left is the layout of very long screens and the evaluation of 56 scripts. Removing it needs list windowing or `content-visibility` with anchor handling, and bundling — architecture changes that were out of scope.
5. **The first seconds after load.** Screens that are not showing start in idle time. An input that arrives while one of those start-up tasks runs waits for it (up to about 100 ms on the desktop profile, 130–350 ms under 4× CPU). The warm-up pauses while the visitor is active, but it cannot interrupt a task that has already begun.
6. **P-20.** Interaction latency under 4× CPU is above 200 ms for most tasks, as before.
7. **P-06 / P-09.** One photo size for every use; no bundling.
8. Run-to-run variation in this lab is about ±15% on times below 300 ms; single outliers of several hundred milliseconds occurred in both builds (for example one 984 ms interaction before and one 856 ms after) and are why medians are reported.

## Files

- `livon/livon-media.js` — film and background-photo loading
- `livon/livon-boot.js` — on-demand screen start-up
- `scripts/livon-performance-quality.mjs` — static check and budgets (runs in `scripts/publish-site.mjs`)
- `tests/livon/performance.test.mjs` — PERF-1 … PERF-60 (54 static/Node, 6 in a browser)
- `assets/livon-mark-icon-120.jpg` — header logo
