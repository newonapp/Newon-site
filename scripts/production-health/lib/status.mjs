/** Status helpers for production health checks. */

export const STATUS = Object.freeze({
  PASS: "PASS",
  WARN: "WARN",
  FAIL: "FAIL",
  UNKNOWN: "UNKNOWN",
  NA: "N/A",
});

const RANK = { FAIL: 0, WARN: 1, UNKNOWN: 2, PASS: 3, "N/A": 4 };

export function finding(status, code, message, extra = {}) {
  return {
    status,
    code,
    message,
    priority: extra.priority || null,
    category: extra.category || null,
    path: extra.path || null,
    manual: !!extra.manual,
    ...extra,
  };
}

/** Worst status among a list (FAIL < WARN < UNKNOWN < PASS). N/A ignored. */
export function rollup(statuses) {
  const list = statuses.filter((s) => s && s !== STATUS.NA);
  if (!list.length) return STATUS.UNKNOWN;
  return list.reduce((a, b) => (RANK[a] <= RANK[b] ? a : b));
}

export function overallFromScore(score, hasFail, { flutterSourceFound = true } = {}) {
  if (hasFail) return "AT_RISK";
  if (!flutterSourceFound) return "INCOMPLETE";
  if (score == null) return "UNKNOWN";
  if (score >= 85) return "HEALTHY";
  if (score >= 70) return "WATCH";
  return "AT_RISK";
}
