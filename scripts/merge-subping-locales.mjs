#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");

const FILES = [
  "ko.json",
  "en.json",
  "ja.json",
  "es.json",
  "pt-br.json",
  "fr.json",
  "de.json",
  "hi.json",
  "id.json",
];

/** One _sp.*.json per site language; must match keys in _sp.en.json */
const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

const TITLE_SUBPING = {
  ko: "SubPing — 구독과 정기 결제를 한눈에",
  en: "SubPing — Subscriptions & recurring bills at a glance",
  ja: "SubPing — サブスクと定期支払いを一目で",
  es: "SubPing — Suscripciones y pagos recurrentes de un vistazo",
  "pt-br": "SubPing — Assinaturas e pagos recorrentes em um só lugar",
  fr: "SubPing — Abonnements et paiements récurrents en un coup d’œil",
  de: "SubPing — Abos & wiederkehrende Zahlungen auf einen Blick",
  hi: "SubPing — सब्सक्रिप्शन और बिल एक नज़र में",
  id: "SubPing — Langganan & tagihan berulang dalam satu pandangan",
};

function loadSp(lang) {
  const fname = SP_FILE_BY_LANG[lang] || "_sp.en.json";
  const p = path.join(LOCALES, fname);
  if (!fs.existsSync(p)) {
    console.error(`merge-subping-locales: missing ${fname} for lang ${lang}, abort`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const refKeys = Object.keys(JSON.parse(fs.readFileSync(path.join(LOCALES, "_sp.en.json"), "utf8"))).sort();

for (const file of FILES) {
  const lang = file.replace(/\.json$/, "");
  const p = path.join(LOCALES, file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.meta = j.meta || {};
  j.meta.titleSubPing = TITLE_SUBPING[lang] || TITLE_SUBPING.en;
  const sp = loadSp(lang);
  const spKeys = Object.keys(sp).sort();
  if (spKeys.join(",") !== refKeys.join(",")) {
    console.error(`merge-subping-locales: key mismatch in ${SP_FILE_BY_LANG[lang] || "?"} vs _sp.en.json`);
    const missing = refKeys.filter((k) => !spKeys.includes(k));
    const extra = spKeys.filter((k) => !refKeys.includes(k));
    if (missing.length) console.error(`  missing: ${missing.join(", ")}`);
    if (extra.length) console.error(`  extra: ${extra.join(", ")}`);
    process.exit(1);
  }
  j.sp = sp;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("merge-subping-locales: OK");
