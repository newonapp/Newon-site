/**
 * Free O/X accent palette (Flutter AppAccentOption ids).
 */
export const FREE_DEFAULT_O = "c20";
export const FREE_DEFAULT_X = "c00";

export const ACCENT_OPTIONS = [
  { id: "c00", hex: "#FF3B3B" },
  { id: "c05", hex: "#FF7A00" },
  { id: "c10", hex: "#FFF700" },
  { id: "c15", hex: "#BFFF00" },
  { id: "c20", hex: "#00FF87" },
  { id: "c25", hex: "#00E5FF" },
  { id: "c30", hex: "#2979FF" },
  { id: "c35", hex: "#D500F9" },
  { id: "c40", hex: "#FF006E" },
  { id: "c50", hex: "#FFFFFF" },
];

const BY_ID = Object.fromEntries(ACCENT_OPTIONS.map((a) => [a.id, a.hex]));

export const ACCENT_O_KEY = "ox_month_accent_o_v3";
export const ACCENT_X_KEY = "ox_month_accent_x_v3";

export function accentHex(id, fallback) {
  return BY_ID[id] || fallback;
}

export function resolveAccents(payload) {
  const oId = `${payload?.[ACCENT_O_KEY] || FREE_DEFAULT_O}`.trim();
  const xId = `${payload?.[ACCENT_X_KEY] || FREE_DEFAULT_X}`.trim();
  return {
    oId: BY_ID[oId] ? oId : FREE_DEFAULT_O,
    xId: BY_ID[xId] ? xId : FREE_DEFAULT_X,
    oHex: accentHex(oId, "#00FF87"),
    xHex: accentHex(xId, "#FF3B3B"),
  };
}
