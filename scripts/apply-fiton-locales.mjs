#!/usr/bin/env node
/** Sync FitOn nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { foEn, foKo } from "./fiton-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleFiton: "FitOn | 운동·스포츠·AI 운동 분석 통합 플랫폼 | Newon",
    metaDescFiton:
      "FitOn은 러닝, 헬스, 홈트, 축구, 농구, 테니스 등 다양한 운동과 스포츠를 기록하고 AI 분석, 커뮤니티, 챌린지, 스포츠 쇼핑까지 연결하는 통합 피트니스 플랫폼입니다.",
    fitonDesc: "운동 · 스포츠 · AI 분석 · 커뮤니티",
    mobileFitonHint: "FitOn 소개 보기",
    fo: foKo,
  },
  en: {
    metaTitleFiton: "FitOn | Workout · Sports · AI Analysis Platform | Newon",
    metaDescFiton:
      "FitOn connects running, gym, home workouts, soccer, basketball, tennis, and more with AI analysis, community, challenges, and sports shopping.",
    fitonDesc: "Workout · Sports · AI analysis · Community",
    mobileFitonHint: "View FitOn intro",
    fo: foEn,
  },
};

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const APP_NS = ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "np", "mw", "eo", "fo"];

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileFitonHint = hint;
  for (const k of APP_NS) {
    j[k] = j[k] || {};
    j[k].mobileFitonHint = hint;
  }
}

for (const lang of LANGS) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const nav = NAV[lang] || {
    metaTitleFiton: NAV.en.metaTitleFiton,
    metaDescFiton: NAV.en.metaDescFiton,
    fitonDesc: NAV.en.fitonDesc,
    mobileFitonHint: NAV.en.mobileFitonHint,
  };
  j.meta = j.meta || {};
  j.meta.titleFiton = nav.metaTitleFiton;
  j.meta.descFiton = nav.metaDescFiton || NAV.en.metaDescFiton;
  if (typeof j.meta.keywords === "string" && !/\bFitOn\b/.test(j.meta.keywords)) {
    j.meta.keywords = j.meta.keywords.replace(/EatOn/, "EatOn, FitOn");
    if (!/\bFitOn\b/.test(j.meta.keywords)) {
      j.meta.keywords = `${j.meta.keywords}, FitOn`;
    }
  }
  j.nav = j.nav || {};
  j.nav.fitonDesc = nav.fitonDesc;
  patchHints(j, nav.mobileFitonHint);

  if (nav.fo) {
    j.fo = nav.fo;
  } else {
    j.fo = { ...(j.fo || {}), ...foEn };
  }

  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-fiton-locales: OK");
