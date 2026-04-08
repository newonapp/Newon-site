#!/usr/bin/env node
/**
 * One-shot: localized HTML build + assemble _publish/ for GitHub Pages (or local preview).
 *
 *   node scripts/publish-site.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "_publish");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const ROOT_ASSETS = [
  "index.html",
  "styles.css",
  "ox-month.css",
  "logo.png",
  "ox-month-logo.png",
  "feature-grid.png",
  "hero-promo.png",
  "step-add-habit.png",
  "step-daily-check.png",
  "step-stats.png",
];

const OPTIONAL_ROOT = ["CNAME", ".nojekyll"];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function copyFileIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function runBuild() {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-i18n.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function assemble() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const name of ["index.html", "styles.css", "ox-month.css"]) {
    const src = path.join(ROOT, name);
    if (!fs.existsSync(src)) {
      console.error(`publish-site: missing ${name}`);
      process.exit(1);
    }
    fs.copyFileSync(src, path.join(OUT, name));
  }

  for (const lang of LANGS) {
    const src = path.join(ROOT, lang);
    if (!fs.statSync(src).isDirectory()) {
      console.error(`publish-site: missing language dir ${lang}/`);
      process.exit(1);
    }
    copyDir(src, path.join(OUT, lang));
  }

  copyDir(path.join(ROOT, "locales"), path.join(OUT, "locales"));

  const i18n = path.join(ROOT, "i18n-img");
  if (fs.existsSync(i18n)) copyDir(i18n, path.join(OUT, "i18n-img"));

  const ox = path.join(ROOT, "ox-img");
  if (fs.existsSync(ox)) copyDir(ox, path.join(OUT, "ox-img"));

  for (const png of ROOT_ASSETS.slice(3)) {
    copyFileIfExists(path.join(ROOT, png), path.join(OUT, png));
  }

  for (const name of OPTIONAL_ROOT) {
    copyFileIfExists(path.join(ROOT, name), path.join(OUT, name));
  }
}

function verify() {
  const required = [
    ...ROOT_ASSETS.map((f) => path.join(OUT, f)),
    path.join(OUT, "ox-img", "month-grid.png"),
    path.join(OUT, "ox-img", "social-proof.png"),
    path.join(OUT, "locales", "en.json"),
  ];
  for (const lang of LANGS) {
    required.push(
      path.join(OUT, lang, "index.html"),
      path.join(OUT, lang, "privacy", "index.html"),
      path.join(OUT, lang, "terms", "index.html")
    );
  }
  for (const f of required) {
    if (!fs.existsSync(f)) {
      console.error(`publish-site verify: missing ${path.relative(ROOT, f)}`);
      process.exit(1);
    }
  }
  console.log("publish-site verify: OK");
}

runBuild();
assemble();

verify();

console.log("publish-site OK →", path.relative(process.cwd(), OUT));
