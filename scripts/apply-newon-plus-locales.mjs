#!/usr/bin/env node
/** Sync Newon+ nav + full page copy into locales/*.json */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { npEn, npKo } from "./newon-plus-data.mjs";
import { npJa, npEs, npPtBr, npFr, npDe, npHi, npId } from "./np-locales-i18n.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");

const NAV = {
  ko: {
    metaTitleNewonPlus: "Newon — Membership · 통합 계정 · Newon",
    newonPlusDesc: "Newon Membership · 통합 계정 · 앱 허브",
    mobileNewonPlusHint: "Newon+ 소개 보기",
    np: npKo,
  },
  en: {
    metaTitleNewonPlus: "Newon — Membership · Unified account · Newon",
    newonPlusDesc: "Newon Membership · Unified account · App hub",
    mobileNewonPlusHint: "View Newon+ intro",
    np: npEn,
  },
  ja: {
    metaTitleNewonPlus: "Newon — パッケージ加入 · プレミアム · Newon",
    newonPlusDesc: "パッケージ加入 · プレミアム特典 · 統合管理",
    mobileNewonPlusHint: "Newon+ の紹介",
    np: npJa,
  },
  es: {
    metaTitleNewonPlus: "Newon — Suscripción paquete · Premium · Newon",
    newonPlusDesc: "Suscripción paquete · Beneficios premium · Gestión integrada",
    mobileNewonPlusHint: "Ver intro de Newon+",
    np: npEs,
  },
  "pt-br": {
    metaTitleNewonPlus: "Newon — Assinatura pacote · Premium · Newon",
    newonPlusDesc: "Assinatura pacote · Benefícios premium · Gestão integrada",
    mobileNewonPlusHint: "Ver intro do Newon+",
    np: npPtBr,
  },
  fr: {
    metaTitleNewonPlus: "Newon — Abonnement pack · Premium · Newon",
    newonPlusDesc: "Abonnement pack · Avantages premium · Gestion unifiée",
    mobileNewonPlusHint: "Voir l'intro Newon+",
    np: npFr,
  },
  de: {
    metaTitleNewonPlus: "Newon — Paket-Abo · Premium · Newon",
    newonPlusDesc: "Paket-Abo · Premium-Vorteile · Integrierte Verwaltung",
    mobileNewonPlusHint: "Newon+ Intro ansehen",
    np: npDe,
  },
  hi: {
    metaTitleNewonPlus: "Newon — पैकेज सब्सक्रिप्शन · Premium · Newon",
    newonPlusDesc: "पैकेज सब्सक्रिप्शन · प्रीमियम लाभ · एकीकृत प्रबंधन",
    mobileNewonPlusHint: "Newon+ परिचय देखें",
    np: npHi,
  },
  id: {
    metaTitleNewonPlus: "Newon — Langganan paket · Premium · Newon",
    newonPlusDesc: "Langganan paket · Manfaat premium · Manajemen terpadu",
    mobileNewonPlusHint: "Lihat intro Newon+",
    np: npId,
  },
};

function patchHints(j, hint) {
  j.nav = j.nav || {};
  j.nav.mobileNewonPlusHint = hint;
  for (const k of ["ox", "sp", "pm", "sv", "bl", "pl", "pu", "gu", "cu", "nt", "np"]) {
    j[k] = j[k] || {};
    if (k === "np") continue;
    j[k].mobileNewonPlusHint = hint;
  }
}

for (const [lang, nav] of Object.entries(NAV)) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  j.meta = j.meta || {};
  j.meta.titleNewonPlus = nav.metaTitleNewonPlus;
  j.nav.newonPlusDesc = nav.newonPlusDesc;
  j.np = nav.np;
  patchHints(j, nav.mobileNewonPlusHint);
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-newon-plus-locales: OK");
