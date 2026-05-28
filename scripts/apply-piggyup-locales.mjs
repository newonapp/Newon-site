#!/usr/bin/env node
/** Sync PiggyUp nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { puEn, puKo } from "./piggyup-data.mjs";
import { puJa, puEs, puPtBr, puFr, puDe, puHi, puId } from "./piggyup-locales-i18n.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitlePiggyup: "PiggyUp — 절약 습관·소비 분석 · Newon",
    piggyupDesc: "절약 습관 · 소비 분석 · AI 코치",
    mobilePiggyupHint: "PiggyUp 소개 보기",
    pu: puKo,
  },
  en: {
    metaTitlePiggyup: "PiggyUp — Saving habits & spending · Newon",
    piggyupDesc: "Saving habits · spending analysis · AI coach",
    mobilePiggyupHint: "Open PiggyUp intro",
    pu: puEn,
  },
  ja: {
    metaTitlePiggyup: "PiggyUp — 節約習慣・消費分析 · Newon",
    piggyupDesc: "節約習慣 · 消費分析 · AIコーチ",
    mobilePiggyupHint: "PiggyUpの紹介を見る",
    pu: puJa,
  },
  es: {
    metaTitlePiggyup: "PiggyUp — Hábitos de ahorro · Newon",
    piggyupDesc: "Hábitos de ahorro · análisis de gastos · coach IA",
    mobilePiggyupHint: "Ver intro de PiggyUp",
    pu: puEs,
  },
  "pt-br": {
    metaTitlePiggyup: "PiggyUp — Hábitos de poupança · Newon",
    piggyupDesc: "Hábitos de poupança · análise de gastos · coach IA",
    mobilePiggyupHint: "Ver introdução ao PiggyUp",
    pu: puPtBr,
  },
  fr: {
    metaTitlePiggyup: "PiggyUp — Habitudes d'épargne · Newon",
    piggyupDesc: "Habitudes d'épargne · analyse des dépenses · coach IA",
    mobilePiggyupHint: "Voir l'intro PiggyUp",
    pu: puFr,
  },
  de: {
    metaTitlePiggyup: "PiggyUp — Spargewohnheiten · Newon",
    piggyupDesc: "Spargewohnheiten · Ausgabenanalyse · KI-Coach",
    mobilePiggyupHint: "PiggyUp-Intro öffnen",
    pu: puDe,
  },
  hi: {
    metaTitlePiggyup: "PiggyUp — बचत की आदत · Newon",
    piggyupDesc: "बचत की आदत · खर्च विश्लेषण · AI कोच",
    mobilePiggyupHint: "PiggyUp परिचय देखें",
    pu: puHi,
  },
  id: {
    metaTitlePiggyup: "PiggyUp — Kebiasaan menabung · Newon",
    piggyupDesc: "Kebiasaan menabung · analisis belanja · coach AI",
    mobilePiggyupHint: "Lihat intro PiggyUp",
    pu: puId,
  },
};

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobilePiggyupHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu"]) {
    j[k] = j[k] || {};
    j[k].mobilePiggyupHint = hint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.meta = j.meta || {};
  j.meta.titlePiggyup = nav.metaTitlePiggyup;
  j.nav.piggyupDesc = nav.piggyupDesc;
  j.pu = nav.pu;
  patchHints(j, nav.mobilePiggyupHint);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-piggyup-locales: OK");
