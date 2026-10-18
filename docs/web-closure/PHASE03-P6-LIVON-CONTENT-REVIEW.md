# PHASE 03 P6 — LIVON content past its review window (content review item, NOT a code defect)

Measured with the real clock on 2026-10-18 (`node scripts/livon-data-quality.mjs`, no `--now`): **13 records** are past the freshness window of their type. All 13 were last checked on 2026-09-24 in one batch. Their `lastCheckedAt` dates were **not** changed to make any test pass.

| Record | Type | Last checked | Review window (days) | Days since last check | Source |
|---|---|---|---|---|---|
| `ex:ex-allilearn` | program | 2026-09-24 | 14 | 23 | official: 늘배움 |
| `ex:ex-hrdkorea` | program | 2026-09-24 | 14 | 23 | official: HRD-Net |
| `ex:ex-lifelong` | program | 2026-09-24 | 14 | 23 | official: 국가평생교육진흥원 |
| `ex:ex-qnet` | program | 2026-09-24 | 14 | 23 | official: 큐넷 |
| `ex:ex-senior-job` | program | 2026-09-24 | 14 | 23 | official: 한국노인인력개발원 |
| `ex:ex-worknet-job` | program | 2026-09-24 | 14 | 23 | official: 고용24 |
| `td:exp-baking` | class | 2026-09-24 | default | 23 | editorial: LIVON 체험 가이드 |
| `td:exp-photo` | class | 2026-09-24 | default | 23 | editorial: LIVON 체험 가이드 |
| `td:exp-pottery` | class | 2026-09-24 | default | 23 | editorial: LIVON 체험 가이드 |
| `td:exp-yoga` | class | 2026-09-24 | default | 23 | editorial: LIVON 웰니스 가이드 |
| `td:learn-digital-senior` | program | 2026-09-24 | 14 | 23 | editorial: LIVON 배움 가이드 |
| `td:learn-finance` | program | 2026-09-24 | 14 | 23 | editorial: LIVON 생활 가이드 |
| `td:learn-kmooc` | program | 2026-09-24 | 14 | 23 | official: K-MOOC |

The data-manager view (`DM.createModel` with the real clock) flags the 7 `ex:`/`td:learn-kmooc` records among these as `STALE_REVIEW_REQUIRED` (P2).

What to do (owner / content editor): re-check each record against its source, then set a new `lastCheckedAt` only after the check. Until then LIVON shows these as "확인 필요" by design.

How the tests treat this (P6):
- **Fixed-clock tests** (RC-14 inventory, DM-11 review queue) judge the data as of 2026-10-01, the date the RC was cut, so they do not change with the day the suite runs. `scripts/livon-data-quality.mjs --now=<ISO>` and `LIVON_NOW` set that clock for the VM only.
- **Real-clock test** RC-14b asserts `stale === 0` against today's clock. It is marked `todo`: it is reported in every run (`# todo 1`) but does not fail the suite, and it turns green by itself once the records are re-checked. It must not be "fixed" by extending dates.
