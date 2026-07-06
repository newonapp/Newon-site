/** OX MONTH-style intro header: label "Brand" + title "Why {App}". */

export const INTRO_LABEL = {
  ko: "브랜드",
  en: "Brand",
  ja: "ブランド",
  es: "Marca",
  "pt-br": "Marca",
  fr: "Marque",
  de: "Marke",
  hi: "ब्रांड",
  id: "Brand",
};

export function introTitle(lang, appName) {
  switch (lang) {
    case "ko":
      return `왜 ${appName}인가`;
    case "ja":
      return `なぜ${appName}なのか`;
    case "es":
      return `¿Por qué ${appName}?`;
    case "pt-br":
      return `Por que ${appName}?`;
    case "fr":
      return `Pourquoi ${appName} ?`;
    case "de":
      return `Warum ${appName}?`;
    case "hi":
      return `${appName} क्यों?`;
    case "id":
      return `Mengapa ${appName}?`;
    default:
      return `Why ${appName}`;
  }
}

/** ns = locale section key; name = display name in title */
export const INTRO_APPS = [
  { ns: "ox", name: "OX MONTH", emoji: "📱" },
  { ns: "sp", name: "SubPing", emoji: "🔔" },
  { ns: "pm", name: "Pillmate", emoji: "💊" },
  { ns: "sv", name: "SAVY", emoji: "💰" },
  { ns: "bl", name: "BabyLog", emoji: "👶" },
  { ns: "pl", name: "PetLog", emoji: "🐾" },
  { ns: "pu", name: "PiggyUp", emoji: "🐷" },
  { ns: "gu", name: "GoalUp", emoji: "🎯" },
  { ns: "cu", name: "CountUp", emoji: "🔢" },
  { ns: "nt", name: "Noting", emoji: "📚" },
  { ns: "np", name: "Newon", emoji: "📦" },
];

export const DATA_FILE_BY_NS = {
  pm: "pm-data.mjs",
  sv: "savy-data.mjs",
  bl: "babylog-data.mjs",
  pl: "petlog-data.mjs",
  pu: "piggyup-data.mjs",
  gu: "goalup-data.mjs",
  cu: "countup-data.mjs",
  nt: "noting-data.mjs",
  np: "newon-plus-data.mjs",
};
