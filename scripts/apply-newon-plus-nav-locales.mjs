#!/usr/bin/env node
/** nav.newonPlusDesc + nav.mobileNewonPlusHint for all site languages. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const LOCALES = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "locales");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const NEWON_PLUS_DESC = {
  ko: "Newon Membership · 통합 계정 · 앱 허브",
  en: "Newon Membership · Unified account · App hub",
  ja: "パッケージ加入 · プレミアム特典 · 統合管理",
  es: "Suscripción paquete · Beneficios premium · Gestión integrada",
  "pt-br": "Assinatura pacote · Benefícios premium · Gestão integrada",
  fr: "Abonnement pack · Avantages premium · Gestion unifiée",
  de: "Paket-Abo · Premium-Vorteile · Integrierte Verwaltung",
  hi: "पैकेज सब्सक्रिप्शन · प्रीमियम लाभ · एकीकृत प्रबंधन",
  id: "Langganan paket · Manfaat premium · Manajemen terpadu",
};

const MOBILE_NEWON_PLUS_HINT = {
  ko: "Newon+ 소개 보기",
  en: "View Newon+ intro",
  ja: "Newon+ の紹介",
  es: "Ver intro de Newon+",
  "pt-br": "Ver intro do Newon+",
  fr: "Voir l’intro Newon+",
  de: "Newon+ Intro ansehen",
  hi: "Newon+ परिचय देखें",
  id: "Lihat intro Newon+",
};

for (const lang of LANGS) {
  const p = path.join(LOCALES, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.nav = j.nav || {};
  j.nav.newonPlusDesc = NEWON_PLUS_DESC[lang] || NEWON_PLUS_DESC.en;
  j.nav.mobileNewonPlusHint = MOBILE_NEWON_PLUS_HINT[lang] || MOBILE_NEWON_PLUS_HINT.en;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

console.log("apply-newon-plus-nav-locales: OK");
