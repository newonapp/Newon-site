#!/usr/bin/env node
/**
 * Writes full `pl` copy into locales/*.json and syncs meta/nav/mobile hints for PetLog.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { plEn, plEs, plJa, plKo, plPtBr } from "./petlog-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const localesDir = path.join(ROOT, "locales");

const NAV_KO = {
  metaTitlePetlog: "PetLog — 반려 기록·건강 · Newon",
  petlogDesc: "반려 기록 · 건강 · 가족 공유 · AI",
  mobilePetlogHint: "PetLog 소개 보기",
};

const NAV_EN = {
  metaTitlePetlog: "PetLog — Pet journaling & health · Newon",
  petlogDesc: "Pet logs · health · family · AI",
  mobilePetlogHint: "Open PetLog intro",
};

const NAV_JA = {
  metaTitlePetlog: "PetLog — ペット記録・健康 · Newon",
  petlogDesc: "ペット記録 · 健康 · 家族共有 · AI",
  mobilePetlogHint: "PetLog の紹介を見る",
};

const NAV_ES = {
  metaTitlePetlog: "PetLog — Registro de mascotas y salud · Newon",
  petlogDesc: "Mascotas · salud · familia · IA",
  mobilePetlogHint: "Ver intro de PetLog",
};

const NAV_PT_BR = {
  metaTitlePetlog: "PetLog — Registro e saúde do pet · Newon",
  petlogDesc: "Pets · saúde · família · IA",
  mobilePetlogHint: "Ver introdução ao PetLog",
};

function patchHints(j, mobilePetlogHint) {
  j.nav = j.nav || {};
  j.nav.mobilePetlogHint = mobilePetlogHint;
  for (const k of ["ox", "sp", "pm", "sv"]) {
    j[k] = j[k] || {};
    j[k].mobilePetlogHint = mobilePetlogHint;
  }
}

function applyFull(relFile, pl, nav) {
  const p = path.join(localesDir, relFile);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.meta = j.meta || {};
  j.meta.titlePetlog = nav.metaTitlePetlog;
  j.nav = j.nav || {};
  j.nav.petlogDesc = nav.petlogDesc;
  patchHints(j, nav.mobilePetlogHint);
  j.pl = pl;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

applyFull("ko.json", plKo, NAV_KO);
applyFull("en.json", plEn, NAV_EN);
applyFull("ja.json", plJa, NAV_JA);
applyFull("es.json", plEs, NAV_ES);
applyFull("pt-br.json", plPtBr, NAV_PT_BR);

const other = ["fr.json", "de.json", "hi.json", "id.json"];
for (const f of other) {
  applyFull(f, plEn, NAV_EN);
}

console.log("apply-petlog-locales: OK");
