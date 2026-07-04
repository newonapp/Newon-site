#!/usr/bin/env node
/** Sync CountUp nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cuEn, cuKo } from "./countup-data.mjs";
import { cuJa, cuEs, cuPtBr, cuFr, cuDe, cuHi, cuId } from "./countup-locales-i18n.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleCountup: "CountUp — 카운트·목표 추적 · Newon",
    countupDesc: "카운트 기록 · 목표 추적 · 성장",
    mobileCountupHint: "CountUp 소개 보기",
    cu: cuKo,
  },
  en: {
    metaTitleCountup: "CountUp — Count tracking & goals · Newon",
    countupDesc: "Count tracking · goal tracking · growth",
    mobileCountupHint: "Open CountUp intro",
    cu: cuEn,
  },
  ja: {
    metaTitleCountup: "CountUp — カウント・目標追跡 · Newon",
    countupDesc: "カウント記録 · 目標追跡 · 成長",
    mobileCountupHint: "CountUpの紹介を見る",
    cu: cuJa,
  },
  es: {
    metaTitleCountup: "CountUp — Conteo y metas · Newon",
    countupDesc: "Registro de conteos · seguimiento de metas · crecimiento",
    mobileCountupHint: "Ver intro de CountUp",
    cu: cuEs,
  },
  "pt-br": {
    metaTitleCountup: "CountUp — Contagem e metas · Newon",
    countupDesc: "Registro de contagens · metas · crescimento",
    mobileCountupHint: "Ver introdução ao CountUp",
    cu: cuPtBr,
  },
  fr: {
    metaTitleCountup: "CountUp — Compteur et objectifs · Newon",
    countupDesc: "Compteur · suivi d'objectifs · progression",
    mobileCountupHint: "Voir l'intro CountUp",
    cu: cuFr,
  },
  de: {
    metaTitleCountup: "CountUp — Zähler & Ziele · Newon",
    countupDesc: "Zähler · Zielverfolgung · Wachstum",
    mobileCountupHint: "CountUp-Intro öffnen",
    cu: cuDe,
  },
  hi: {
    metaTitleCountup: "CountUp — काउंट और लक्ष्य · Newon",
    countupDesc: "काउंट रिकॉर्ड · लक्ष्य ट्रैकिंग · विकास",
    mobileCountupHint: "CountUp परिचय देखें",
    cu: cuHi,
  },
  id: {
    metaTitleCountup: "CountUp — Hitungan & target · Newon",
    countupDesc: "Catatan hitungan · pelacakan target · pertumbuhan",
    mobileCountupHint: "Lihat intro CountUp",
    cu: cuId,
  },
};

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileCountupHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu"]) {
    j[k] = j[k] || {};
    j[k].mobileCountupHint = hint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.meta = j.meta || {};
  j.meta.titleCountup = nav.metaTitleCountup;
  j.nav.countupDesc = nav.countupDesc;
  j.cu = nav.cu;
  patchHints(j, nav.mobileCountupHint);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-countup-locales: OK");
