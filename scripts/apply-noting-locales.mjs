#!/usr/bin/env node
/** Sync Noting nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ntEn, ntKo } from "./noting-data.mjs";
import { ntJa, ntEs, ntPtBr, ntFr, ntDe, ntHi, ntId } from "./noting-locales-i18n.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleNoting: "Noting — 필사·독서 기록 · Newon",
    notingDesc: "필사 · 독서 기록 · 독서 노트",
    mobileNotingHint: "Noting 소개 보기",
    nt: ntKo,
  },
  en: {
    metaTitleNoting: "Noting — Transcription & reading notes · Newon",
    notingDesc: "Transcription · reading log · notes",
    mobileNotingHint: "Open Noting intro",
    nt: ntEn,
  },
  ja: {
    metaTitleNoting: "Noting — 写経・読書記録 · Newon",
    notingDesc: "写経 · 読書記録 · 読書ノート",
    mobileNotingHint: "Notingの紹介を見る",
    nt: ntJa,
  },
  es: {
    metaTitleNoting: "Noting — Transcripción y notas · Newon",
    notingDesc: "Transcripción · registro · notas",
    mobileNotingHint: "Ver intro de Noting",
    nt: ntEs,
  },
  "pt-br": {
    metaTitleNoting: "Noting — Transcrição e notas · Newon",
    notingDesc: "Transcrição · registro · notas",
    mobileNotingHint: "Ver introdução ao Noting",
    nt: ntPtBr,
  },
  fr: {
    metaTitleNoting: "Noting — Transcription et notes · Newon",
    notingDesc: "Transcription · journal · notes",
    mobileNotingHint: "Voir l'intro Noting",
    nt: ntFr,
  },
  de: {
    metaTitleNoting: "Noting — Abschrift & Lesenotizen · Newon",
    notingDesc: "Abschrift · Leselog · Notizen",
    mobileNotingHint: "Noting-Intro öffnen",
    nt: ntDe,
  },
  hi: {
    metaTitleNoting: "Noting — लिप्यंतरण · Newon",
    notingDesc: "लिप्यंतरण · पढ़ाई लॉग · नोट",
    mobileNotingHint: "Noting परिचय देखें",
    nt: ntHi,
  },
  id: {
    metaTitleNoting: "Noting — Transkripsi & catatan · Newon",
    notingDesc: "Transkripsi · log baca · catatan",
    mobileNotingHint: "Lihat intro Noting",
    nt: ntId,
  },
};

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileNotingHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "nt"]) {
    j[k] = j[k] || {};
    j[k].mobileNotingHint = hint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.meta = j.meta || {};
  j.meta.titleNoting = nav.metaTitleNoting;
  j.nav.notingDesc = nav.notingDesc;
  j.nt = nav.nt;
  patchHints(j, nav.mobileNotingHint);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-noting-locales: OK");
