/**
 * Single source for verified Newon company metrics (About, Home, Portfolio, Footer).
 * Never invent downloads, revenue, or user counts.
 */
import { APP_CATALOG, PORTFOLIO_STATS, visibleStats } from "./portfolio-data.mjs";
import { getLabsExperiments } from "./lab-experiments.mjs";

/** @returns {{ products: string, languages: string, countries: string, experiments: string }} */
export function getCompanyMetrics() {
  const stats = visibleStats(PORTFOLIO_STATS);
  const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
  return {
    products: String(APP_CATALOG.length),
    languages: String(byId.languages?.value || "13"),
    countries: String(byId.countries?.value || "177"),
    experiments: String(getLabsExperiments().length),
  };
}
