import { SCORE_WEIGHTS } from "../config.mjs";
import { STATUS } from "./status.mjs";

const STATUS_POINTS = {
  [STATUS.PASS]: 1,
  [STATUS.WARN]: 0.55,
  [STATUS.UNKNOWN]: 0.35,
  [STATUS.FAIL]: 0,
};

/**
 * @param {Record<string, string>} dims — keys match SCORE_WEIGHTS; value PASS|WARN|FAIL|UNKNOWN|N/A
 * @returns {{ score: number|null, applicable: string[], detail: Record<string, number|null> }}
 */
export function computeHealthScore(dims) {
  let earned = 0;
  let max = 0;
  const detail = {};
  const applicable = [];

  for (const [key, weight] of Object.entries(SCORE_WEIGHTS)) {
    const st = dims[key] || STATUS.UNKNOWN;
    if (st === STATUS.NA) {
      detail[key] = null;
      continue;
    }
    applicable.push(key);
    max += weight;
    const factor = STATUS_POINTS[st] ?? STATUS_POINTS[STATUS.UNKNOWN];
    const pts = Math.round(weight * factor * 10) / 10;
    detail[key] = pts;
    earned += pts;
  }

  if (max === 0) return { score: null, applicable, detail };
  return {
    score: Math.round((earned / max) * 100),
    applicable,
    detail,
  };
}
