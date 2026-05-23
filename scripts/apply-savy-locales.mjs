#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { svEn, svKo } from "./savy-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function apply(file, sv, metaTitle, navDesc, navHint) {
  const p = path.join(ROOT, "locales", file);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.sv = sv;
  j.meta.titleSavy = metaTitle;
  j.nav.savyDesc = navDesc;
  j.nav.mobileSavyHint = navHint;
  j.ox.mobileSavyHint = navHint;
  j.sp.mobileSavyHint = navHint;
  j.pm.mobileSavyHint = navHint;
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n", "utf8");
}

const navDescEn = "Spending · income · subscriptions · AI";
const navDescKo = "지출 · 수입 · 구독 · AI 분석";
const navHintEn = "Open SAVY intro";
const navHintKo = "SAVY 소개 보기";

apply("en.json", svEn, "SAVY — Spending, income & subscriptions · Newon", navDescEn, navHintEn);
apply("ko.json", svKo, "SAVY — 지출·수입·구독 · Newon", navDescKo, navHintKo);

console.log("apply-savy-locales: OK (en, ko)");
