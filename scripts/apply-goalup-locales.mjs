#!/usr/bin/env node
/** Sync GoalUp nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { guEn, guKo } from "./goalup-data.mjs";
import { guJa, guEs, guPtBr, guFr, guDe, guHi, guId } from "./goalup-locales-i18n.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleGoalup: "GoalUp — 목표 관리·챌린지 · Newon",
    goalupDesc: "목표 관리 · 챌린지 · 성장 기록",
    mobileGoalupHint: "GoalUp 소개 보기",
    gu: guKo,
  },
  en: {
    metaTitleGoalup: "GoalUp — Goals & challenges · Newon",
    goalupDesc: "Goal management · challenges · growth log",
    mobileGoalupHint: "Open GoalUp intro",
    gu: guEn,
  },
  ja: {
    metaTitleGoalup: "GoalUp — 目標管理・チャレンジ · Newon",
    goalupDesc: "目標管理 · チャレンジ · 成長記録",
    mobileGoalupHint: "GoalUpの紹介を見る",
    gu: guJa,
  },
  es: {
    metaTitleGoalup: "GoalUp — Metas y retos · Newon",
    goalupDesc: "Gestión de metas · retos · registro de crecimiento",
    mobileGoalupHint: "Ver intro de GoalUp",
    gu: guEs,
  },
  "pt-br": {
    metaTitleGoalup: "GoalUp — Metas e desafios · Newon",
    goalupDesc: "Gestão de metas · desafios · registro de crescimento",
    mobileGoalupHint: "Ver introdução ao GoalUp",
    gu: guPtBr,
  },
  fr: {
    metaTitleGoalup: "GoalUp — Objectifs et défis · Newon",
    goalupDesc: "Gestion d'objectifs · défis · journal de progression",
    mobileGoalupHint: "Voir l'intro GoalUp",
    gu: guFr,
  },
  de: {
    metaTitleGoalup: "GoalUp — Ziele & Challenges · Newon",
    goalupDesc: "Zielverwaltung · Challenges · Wachstumsprotokoll",
    mobileGoalupHint: "GoalUp-Intro öffnen",
    gu: guDe,
  },
  hi: {
    metaTitleGoalup: "GoalUp — लक्ष्य और चैलेंज · Newon",
    goalupDesc: "लक्ष्य प्रबंधन · चैलेंज · विकास रिकॉर्ड",
    mobileGoalupHint: "GoalUp परिचय देखें",
    gu: guHi,
  },
  id: {
    metaTitleGoalup: "GoalUp — Target & tantangan · Newon",
    goalupDesc: "Manajemen target · tantangan · catatan pertumbuhan",
    mobileGoalupHint: "Lihat intro GoalUp",
    gu: guId,
  },
};

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileGoalupHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu"]) {
    j[k] = j[k] || {};
    j[k].mobileGoalupHint = hint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.meta = j.meta || {};
  j.meta.titleGoalup = nav.metaTitleGoalup;
  j.nav.goalupDesc = nav.goalupDesc;
  j.gu = nav.gu;
  patchHints(j, nav.mobileGoalupHint);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-goalup-locales: OK");
