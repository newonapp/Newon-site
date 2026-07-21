#!/usr/bin/env node
/** Sync My World nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mwEn, mwEsShowcase, mwJaShowcase, mwKo, mwPtBrShowcase } from "./myworld-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleMyworld: "My World — 여행 기록 · 여행 지도 · AI 리포트 · Newon",
    myworldDesc: "여행 기록 · 여행 지도 · AI 리포트",
    mobileMyworldHint: "My World 소개 보기",
    mw: mwKo,
  },
  en: {
    metaTitleMyworld: "My World — Travel journal · map · AI report · Newon",
    myworldDesc: "Travel journal · Travel map · AI report",
    mobileMyworldHint: "View My World intro",
    mw: mwEn,
  },
  ja: {
    metaTitleMyworld: "My World — 旅行記録 · 地図 · AIレポート · Newon",
    myworldDesc: "旅行記録 · 旅行地図 · AIレポート",
    mobileMyworldHint: "My Worldの紹介を見る",
    mwPatch: mwJaShowcase,
  },
  es: {
    metaTitleMyworld: "My World — Diario de viajes · mapa · informe IA · Newon",
    myworldDesc: "Diario de viajes · Mapa de viajes · Informe IA",
    mobileMyworldHint: "Ver la introducción de My World",
    mwPatch: mwEsShowcase,
  },
  "pt-br": {
    metaTitleMyworld: "My World — Diário de viagens · mapa · relatório IA · Newon",
    myworldDesc: "Diário de viagens · Mapa de viagens · Relatório IA",
    mobileMyworldHint: "Ver a introdução do My World",
    mwPatch: mwPtBrShowcase,
  },
};

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileMyworldHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "np", "mw"]) {
    j[k] = j[k] || {};
    j[k].mobileMyworldHint = hint;
  }
}

for (const lang of LANGS) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const nav = NAV[lang] || {
    metaTitleMyworld: NAV.en.metaTitleMyworld,
    myworldDesc: NAV.en.myworldDesc,
    mobileMyworldHint: NAV.en.mobileMyworldHint,
  };
  j.meta = j.meta || {};
  j.meta.titleMyworld = nav.metaTitleMyworld;
  j.nav = j.nav || {};
  j.nav.myworldDesc = nav.myworldDesc;
  patchHints(j, nav.mobileMyworldHint);

  if (nav.mw) {
    j.mw = nav.mw;
  } else if (nav.mwPatch) {
    j.mw = { ...(j.mw || {}), ...nav.mwPatch };
  }

  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-myworld-locales: OK");
