#!/usr/bin/env node
/** Merge deleteAccountLink + deleteAccount into every app locale section. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DELETE_ACCOUNT_APPS, deleteAccountFields } from "./delete-account-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");

const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

for (const lang of SITE_LANGS) {
  const file = `${lang}.json`;
  const p = path.join(LOCALES, file);
  if (!fs.existsSync(p)) continue;
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const fieldsLang = lang === "ko" ? "ko" : "en";
  for (const app of DELETE_ACCOUNT_APPS) {
    if (app.skipLocale) continue;
    const fields = deleteAccountFields(app.name, fieldsLang);
    j[app.ns] = { ...(j[app.ns] || {}), ...fields };
  }
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

for (const lang of SITE_LANGS) {
  const fname = SP_FILE_BY_LANG[lang];
  if (!fname) continue;
  const p = path.join(LOCALES, fname);
  if (!fs.existsSync(p)) continue;
  const sp = JSON.parse(fs.readFileSync(p, "utf8"));
  const fieldsLang = lang === "ko" ? "ko" : "en";
  Object.assign(sp, deleteAccountFields("SubPing", fieldsLang));
  fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
}

console.log("apply-delete-account-locales: OK");
