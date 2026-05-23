#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { blEn, blEs, blJa, blKo, blPtBr } from "./babylog-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const localesDir = path.join(ROOT, "locales");

const navEn = {
  titleBabylog: "BabyLog — Parenting journal & growth · Newon",
  babylogDesc: "Parenting · growth · family · AI",
  mobileBabylogHint: "Open BabyLog intro",
  drawerBl: "Open BabyLog intro",
};

const navKo = {
  titleBabylog: "BabyLog — 육아 기록·성장 · Newon",
  babylogDesc: "육아 기록 · 성장 · 가족 공유 · AI",
  mobileBabylogHint: "BabyLog 소개 보기",
  drawerBl: "BabyLog 소개 보기",
};

const navJa = {
  titleBabylog: "BabyLog — 育児記録・成長 · Newon",
  babylogDesc: "育児記録 · 成長 · 家族共有 · AI",
  mobileBabylogHint: "BabyLogの紹介を開く",
  drawerBl: "BabyLogの紹介を開く",
};

const navEs = {
  titleBabylog: "BabyLog — Diario parental y crecimiento · Newon",
  babylogDesc: "Crianza · crecimiento · familia · IA",
  mobileBabylogHint: "Abrir introducción a BabyLog",
  drawerBl: "Abrir introducción a BabyLog",
};

const navPtBr = {
  titleBabylog: "BabyLog — Diário parental e crescimento · Newon",
  babylogDesc: "Cuidados · crescimento · família · IA",
  mobileBabylogHint: "Abrir apresentação do BabyLog",
  drawerBl: "Abrir apresentação do BabyLog",
};

function patchNav(metaTitle, desc, hint, drawerBlVal) {
  return (j) => {
    j.meta = j.meta || {};
    j.meta.titleBabylog = metaTitle;
    j.nav = j.nav || {};
    j.nav.babylogDesc = desc;
    j.nav.mobileBabylogHint = hint;
    j.ox = j.ox || {};
    j.ox.mobileBabylogHint = hint;
    j.sp = j.sp || {};
    j.sp.mobileBabylogHint = hint;
    j.pm = j.pm || {};
    j.pm.mobileBabylogHint = hint;
    j.sv = j.sv || {};
    j.sv.mobileBabylogHint = hint;
    j.sv.drawerBl = drawerBlVal;
  };
}

function applyFull(file, bl, nav) {
  const p = path.join(localesDir, file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.bl = bl;
  patchNav(nav.titleBabylog, nav.babylogDesc, nav.mobileBabylogHint, nav.drawerBl)(j);
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

applyFull("ko.json", blKo, navKo);
applyFull("en.json", blEn, navEn);
applyFull("ja.json", blJa, navJa);
applyFull("es.json", blEs, navEs);
applyFull("pt-br.json", blPtBr, navPtBr);

const other = ["fr.json", "de.json", "hi.json", "id.json"];
for (const f of other) {
  const p = path.join(localesDir, f);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  patchNav(navEn.titleBabylog, navEn.babylogDesc, navEn.mobileBabylogHint, navEn.drawerBl)(j);
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-babylog-locales: OK");
