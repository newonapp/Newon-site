#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pmEn, pmKo } from "./pm-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function apply(file, pm) {
  const p = path.join(ROOT, "locales", file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.pm = pm;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

apply("en.json", pmEn);
apply("ko.json", pmKo);
console.log("apply-pm-locales: OK (en, ko)");
