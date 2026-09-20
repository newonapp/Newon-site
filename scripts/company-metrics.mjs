/**
 * Single source for verified Newon company metrics (About, Home, Portfolio, Footer).
 * Never invent downloads, revenue, or user counts.
 *
 * Canonical product mix (2026-09):
 * - Apps: 11
 * - Games: 1
 * - Web: 1
 * - Total services (marketing display): 13+
 */
import { PORTFOLIO_STATS, visibleStats } from "./portfolio-data.mjs";
import { getLabsExperiments } from "./lab-experiments.mjs";

/** App count shown when copy refers to apps only. */
export const APP_COUNT = 11;
/** Total services / products marketing figure. */
export const SERVICE_COUNT = "13+";

/** @returns {{ apps: string, products: string, languages: string, countries: string, experiments: string }} */
export function getCompanyMetrics() {
  const stats = visibleStats(PORTFOLIO_STATS);
  const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
  return {
    apps: String(APP_COUNT),
    products: SERVICE_COUNT,
    languages: String(byId.languages?.value || "13"),
    countries: String(byId.countries?.value || "177"),
    experiments: String(getLabsExperiments().length),
  };
}
