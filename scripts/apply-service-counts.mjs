#!/usr/bin/env node
/**
 * Unify service counts across locales:
 * - Apps: 11
 * - Games: 1 · Web: 1
 * - Total services (display): 13+
 *
 * Does not invent other metrics (countries, languages, downloads).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCALES = path.join(ROOT, "locales");

/** Ordered replacements — longer / more specific first */
const REPLACEMENTS = [
  // Total services (was 14+)
  ["14+ 서비스", "13+ 서비스"],
  ["14+ services", "13+ services"],
  ["14+ Services", "13+ Services"],
  ["14+ servicios", "13+ servicios"],
  ["14+ Serviços", "13+ Serviços"],
  ["14+ serviços", "13+ serviços"],
  ["14+ Dienste", "13+ Dienste"],
  ["14+ サービス", "13+ サービス"],
  ["14+ सेवाएँ", "13+ सेवाएँ"],
  ["14+ layanan", "13+ layanan"],

  // Hero / card value tokens
  [">14+</span>", ">13+</span>"],
  ['"14+"', '"13+"'],
  ["14+ Services", "13+ Services"],

  // Stats that said 14+ apps when meaning total services / platform
  ["with 14+ apps and one account", "with 13+ services and one account"],
  ["con 14+ apps y una cuenta", "con 13+ servicios y una cuenta"],
  ["com 14+ apps e uma conta", "com 13+ serviços e uma conta"],
  ["avec 14+ apps et un compte", "avec 13+ services et un compte"],

  ["plataforma de vida con 14+ apps y una cuenta", "plataforma de vida con 13+ servicios y una cuenta"],
  ["plataforma de vida com 14+ apps e uma conta", "plataforma de vida com 13+ serviços e uma conta"],
  ["plateforme de vie avec 14+ apps et un compte", "plateforme de vie avec 13+ services et un compte"],
  ["14+アプリと1アカウント", "13+サービスと1アカウント"],
  ["14+アプリ、", "13+サービス、"],
  ["12 apps de vida", "11 apps de vida"],
  ["12 apps de vie", "11 apps de vie"],

  ["mit 14+ Apps und einem Konto", "mit 13+ Diensten und einem Konto"],
  ["14+アプリと1アカウント", "13+サービスと1アカウント"],
  ["14+ ऐप और एक खाते", "13+ सेवाएँ और एक खाते"],
  ["dengan 14+ app dan satu akun", "dengan 13+ layanan dan satu akun"],
  ["dengan 12+ app dan satu akun", "dengan 13+ layanan dan satu akun"],
  ["mit 12+ Apps und einem Konto", "mit 13+ Diensten und einem Konto"],
  ["12+ ऐप और एक खाते", "13+ सेवाएँ और एक खाते"],

  ["14+ apps,", "13+ services,"],
  ["14+ apps<br", "13+ services<br"],
  ["14+ Apps,", "13+ Dienste,"],
  ["14+アプリ、", "13+サービス、"],
  ["14+ ऐप,", "13+ सेवाएँ,"],
  ["14+ app,", "13+ layanan,"],
  ["12+ Apps,", "13+ Dienste,"],
  ["12+ ऐप,", "13+ सेवाएँ,"],
  ["12+ app,", "13+ layanan,"],

  // App-only counts (12 → 11)
  ["12개 앱 서비스 운영", "11개 앱 운영"],
  ["12개 앱 출시", "앱 11개"],
  ["12개의 앱에서 시작", "11개의 앱에서 시작"],
  ["12개의 아이디어", "11개의 아이디어"],
  ["12 app services", "11 apps"],
  ["12 apps released", "11 apps released"],
  ["Starting from 12 apps", "Starting from 11 apps"],
  ["12 apps publicadas", "11 apps publicadas"],
  ["12 apps lançados", "11 apps lançados"],
  ["12 apps publiées", "11 apps publiées"],
  ["12 Apps veröffentlicht", "11 Apps veröffentlicht"],
  ["12アプリを運営", "11アプリを運営"],
  ["12本のアプリ", "11本のアプリ"],
  ["12 ऐप सेवाएँ", "11 ऐप"],
  ["12 ऐप्स जारी", "11 ऐप जारी"],
  ["12 ऐप जारी", "11 ऐप जारी"],
  ["12 aplikasi dirilis", "11 aplikasi dirilis"],
  ["12 services d'apps", "11 apps"],
  ["12 servicios de apps", "11 apps"],
  ["12 serviços de apps", "11 apps"],
  ["12 App-Dienste", "11 Apps"],
  ["• 12 apps publicadas", "• 11 apps publicadas"],
  ["• 12 apps lançados", "• 11 apps lançados"],
  ["• 12 apps publiées", "• 11 apps publiées"],
  ["Partiendo de 12 apps", "Partiendo de 11 apps"],
  ["Começando com 12 apps", "Começando com 11 apps"],
  ["À partir de 12 apps", "À partir de 11 apps"],
  ["Mit 12 Apps als Start", "Mit 11 Apps als Start"],
  ["Ausgehend von 12 Apps", "Ausgehend von 11 Apps"],
  ["12 apps de productividad", "11 apps de productividad"],
  ["12 apps de vie", "11 apps de vie"],
  ["12 apps pour la", "11 apps pour la"],
  ["12 Apps für", "11 Apps für"],
  ["12 ideas.", "11 ideas."],
  ["12 ideas.<br", "11 ideas.<br"],

  // Standalone product meta value that was just 14+
  ['heroMetaProductsVal": "14+"', 'heroMetaProductsVal": "13+"'],
  ['heroMetaProductsVal": "14+ Services"', 'heroMetaProductsVal": "13+ Services"'],
];

function patchString(s) {
  let out = s;
  let n = 0;
  for (const [from, to] of REPLACEMENTS) {
    if (!from || from === to) continue;
    if (out.includes(from)) {
      const c = out.split(from).length - 1;
      out = out.split(from).join(to);
      n += c;
    }
  }
  return { out, n };
}

function walk(obj, hits) {
  if (typeof obj === "string") {
    const { out, n } = patchString(obj);
    if (n) {
      hits.n += n;
      return out;
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map((v) => walk(v, hits));
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) obj[k] = walk(obj[k], hits);
  }
  return obj;
}

let files = 0;
let total = 0;
for (const name of fs.readdirSync(LOCALES).filter((f) => f.endsWith(".json"))) {
  const file = path.join(LOCALES, name);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const hits = { n: 0 };
  walk(data, hits);
  if (hits.n) {
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    files += 1;
    total += hits.n;
    console.log(`locales/${name}: ${hits.n} replacements`);
  }
}

// Pack footers used by i18n pipeline
const packsRoot = path.join(ROOT, "scripts/i18n/packs");
if (fs.existsSync(packsRoot)) {
  for (const lang of fs.readdirSync(packsRoot)) {
    const foot = path.join(packsRoot, lang, "chrome-nav-footer.json");
    if (!fs.existsSync(foot)) continue;
    const data = JSON.parse(fs.readFileSync(foot, "utf8"));
    const hits = { n: 0 };
    walk(data, hits);
    if (hits.n) {
      fs.writeFileSync(foot, `${JSON.stringify(data, null, 2)}\n`);
      files += 1;
      total += hits.n;
      console.log(`packs/${lang}/chrome-nav-footer.json: ${hits.n}`);
    }
  }
}

console.log(`apply-service-counts: ${files} files, ${total} replacements`);
