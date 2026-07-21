#!/usr/bin/env node
/** nav.myworldDesc + nav.mobileMyworldHint for all site languages. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LOCALES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "locales");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const MYWORLD_DESC = {
  ko: "여행 기록 · 여행 지도 · AI 리포트",
  en: "Travel journal · Travel map · AI report",
  ja: "旅行記録 · 旅行マップ · AIレポート",
  es: "Diario de viaje · Mapa · Informe IA",
  "pt-br": "Diário de viagem · Mapa · Relatório IA",
  fr: "Journal de voyage · Carte · Rapport IA",
  de: "Reisetagebuch · Reisekarte · KI-Bericht",
  hi: "यात्रा जर्नल · यात्रा मानचित्र · AI रिपोर्ट",
  id: "Jurnal perjalanan · Peta · Laporan AI",
};

const MOBILE_MYWORLD_HINT = {
  ko: "My World 소개 보기",
  en: "View My World intro",
  ja: "My World の紹介",
  es: "Ver intro de My World",
  "pt-br": "Ver intro do My World",
  fr: "Voir l’intro My World",
  de: "My World Intro ansehen",
  hi: "My World परिचय देखें",
  id: "Lihat intro My World",
};

for (const lang of LANGS) {
  const p = path.join(LOCALES, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.nav = j.nav || {};
  j.nav.myworldDesc = MYWORLD_DESC[lang] || MYWORLD_DESC.en;
  j.nav.mobileMyworldHint = MOBILE_MYWORLD_HINT[lang] || MOBILE_MYWORLD_HINT.en;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-myworld-nav-locales: OK");
