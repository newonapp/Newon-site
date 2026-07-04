#!/usr/bin/env node
/** Sync GoalUp + CountUp nav strings into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    goalupDesc: "목표 관리 · 챌린지 · 성장 기록",
    countupDesc: "카운트 기록 · 목표 추적 · 성장",
    mobileGoalupHint: "GoalUp 소개 보기",
    mobileCountupHint: "CountUp 소개 보기",
  },
  en: {
    goalupDesc: "Goal management · challenges · growth log",
    countupDesc: "Count tracking · goal tracking · growth",
    mobileGoalupHint: "Open GoalUp intro",
    mobileCountupHint: "Open CountUp intro",
  },
  ja: {
    goalupDesc: "目標管理 · チャレンジ · 成長記録",
    countupDesc: "カウント記録 · 目標追跡 · 成長",
    mobileGoalupHint: "GoalUpの紹介を見る",
    mobileCountupHint: "CountUpの紹介を見る",
  },
  es: {
    goalupDesc: "Gestión de metas · retos · registro de crecimiento",
    countupDesc: "Registro de conteos · seguimiento de metas · crecimiento",
    mobileGoalupHint: "Ver intro de GoalUp",
    mobileCountupHint: "Ver intro de CountUp",
  },
  "pt-br": {
    goalupDesc: "Gestão de metas · desafios · registro de crescimento",
    countupDesc: "Registro de contagens · metas · crescimento",
    mobileGoalupHint: "Ver introdução ao GoalUp",
    mobileCountupHint: "Ver introdução ao CountUp",
  },
  fr: {
    goalupDesc: "Gestion d'objectifs · défis · journal de progression",
    countupDesc: "Compteur · suivi d'objectifs · progression",
    mobileGoalupHint: "Voir l'intro GoalUp",
    mobileCountupHint: "Voir l'intro CountUp",
  },
  de: {
    goalupDesc: "Zielverwaltung · Challenges · Wachstumsprotokoll",
    countupDesc: "Zähler · Zielverfolgung · Wachstum",
    mobileGoalupHint: "GoalUp-Intro öffnen",
    mobileCountupHint: "CountUp-Intro öffnen",
  },
  hi: {
    goalupDesc: "लक्ष्य प्रबंधन · चैलेंज · विकास रिकॉर्ड",
    countupDesc: "काउंट रिकॉर्ड · लक्ष्य ट्रैकिंग · विकास",
    mobileGoalupHint: "GoalUp परिचय देखें",
    mobileCountupHint: "CountUp परिचय देखें",
  },
  id: {
    goalupDesc: "Manajemen target · tantangan · catatan pertumbuhan",
    countupDesc: "Catatan hitungan · pelacakan target · pertumbuhan",
    mobileGoalupHint: "Lihat intro GoalUp",
    mobileCountupHint: "Lihat intro CountUp",
  },
};

function patchHints(j, hints) {
  j.nav = j.nav || {};
  j.nav.mobileGoalupHint = hints.mobileGoalupHint;
  j.nav.mobileCountupHint = hints.mobileCountupHint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu"]) {
    j[k] = j[k] || {};
    j[k].mobileGoalupHint = hints.mobileGoalupHint;
    j[k].mobileCountupHint = hints.mobileCountupHint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.nav.goalupDesc = nav.goalupDesc;
  j.nav.countupDesc = nav.countupDesc;
  patchHints(j, nav);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-goalup-countup-locales: OK");
