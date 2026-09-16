#!/usr/bin/env node
/** Sync EatOn nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eoEn, eoKo } from "./eaton-data.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleEaton: "EatOn | 요리·외식·배달·AI 레시피 통합 푸드 플랫폼 | Newon",
    metaDescEaton:
      "EatOn은 YouTube, Instagram, Blog의 인기 레시피부터 AI 레시피 요약, 유명 맛집, 배달 음식, 재료 쇼핑까지 한곳에서 탐색하는 통합 푸드 플랫폼입니다.",
    eatonDesc: "요리 · 외식 · 배달 · AI 레시피",
    mobileEatonHint: "EatOn 소개 보기",
    eo: eoKo,
  },
  en: {
    metaTitleEaton: "EatOn | Cooking · Dining · Delivery · AI Recipes Food Platform | Newon",
    metaDescEaton:
      "EatOn brings popular recipes from YouTube, Instagram, and blogs together with AI recipe summaries, restaurant discovery, delivery exploration, and ingredient shopping.",
    eatonDesc: "Cooking · Dining out · Delivery · AI recipes",
    mobileEatonHint: "View EatOn intro",
    eo: eoEn,
  },
};

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileEatonHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "np", "mw", "eo"]) {
    j[k] = j[k] || {};
    j[k].mobileEatonHint = hint;
  }
}

for (const lang of LANGS) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const nav = NAV[lang] || {
    metaTitleEaton: NAV.en.metaTitleEaton,
    metaDescEaton: NAV.en.metaDescEaton,
    eatonDesc: NAV.en.eatonDesc,
    mobileEatonHint: NAV.en.mobileEatonHint,
  };
  j.meta = j.meta || {};
  j.meta.titleEaton = nav.metaTitleEaton;
  j.meta.descEaton = nav.metaDescEaton || NAV.en.metaDescEaton;
  if (typeof j.meta.keywords === "string" && !/\bEatOn\b/.test(j.meta.keywords)) {
    j.meta.keywords = j.meta.keywords.replace(/My World/, "My World, EatOn");
    if (!/\bEatOn\b/.test(j.meta.keywords)) {
      j.meta.keywords = `${j.meta.keywords}, EatOn`;
    }
  }
  j.nav = j.nav || {};
  j.nav.eatonDesc = nav.eatonDesc;
  patchHints(j, nav.mobileEatonHint);

  if (nav.eo) {
    j.eo = nav.eo;
  } else {
    j.eo = { ...(j.eo || {}), ...eoEn };
  }

  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-eaton-locales: OK");
