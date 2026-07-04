#!/usr/bin/env node
/** Copy nav.mobileSavyHint → sp.mobileSavyHint so SubPing mobile drawer is translated in every locale. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const localesDir = path.join(ROOT, "locales");
const langs = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

for (const lang of langs) {
  const file = path.join(localesDir, `${lang}.json`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!j.sp) j.sp = {};
  const hint = j.nav?.mobileSavyHint || j.sp.mobileSavyHint;
  if (hint) j.sp.mobileSavyHint = hint;
  fs.writeFileSync(file, `${JSON.stringify(j, null, 2)}\n`, "utf8");
}

console.log("sync-sp-mobile-hints: OK");
