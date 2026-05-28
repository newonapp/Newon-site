#!/usr/bin/env node
/**
 * One-shot: localized HTML build + assemble _publish/ for GitHub Pages (or local preview).
 *
 *   node scripts/publish-site.mjs
 *
 * 배포 단위는 오직 _publish/ 한 폴더입니다. (Git에는 소스만 커밋; Pages에는 Actions가 _publish 업로드)
 * HTML이 참조하는 이미지·CSS·JS·로케일·i18n 이미지는 모두 이 스크립트가 같은 트리로 복사합니다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "_publish");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

/** 사이트 루트 URL (/파일명) 그대로 쓰는 HTML·CSS·JS — HTML과 같은 층에 둠 */
const PUBLISH_ROOT_CORE = [
  "index.html",
  "lang-nav.js",
  "lang-dropdown.js",
  "theme-shell.js",
  "styles.css",
  "ox-month.css",
];

/**
 * 사이트 루트에 두는 래스터 에셋 (템플릿에서 /logo.png 처럼 참조).
 * i18n-img·ox-img·subping-img 아래 파일은 각 디렉터리 복사로 함께 따라감.
 */
const PUBLISH_ROOT_IMAGES = [
  "logo.png",
  "ox-month-logo.png",
  "subping-logo.png",
  "pillmate-logo.png",
  "savy-logo.png",
  "babylog-logo.png",
  "petlog-logo.png",
  "piggyup-logo.png",
  "subping-hero-mark.png",
  "feature-grid.png",
  "hero-promo.png",
  "step-add-habit.png",
  "step-daily-check.png",
  "step-stats.png",
];

/** 통째로 _publish/<이름>/ 에 복사 (HTML과 상대 경로로 묶임) */
const PUBLISH_COPY_DIRS = [
  { from: "locales", to: "locales", required: true },
  { from: "i18n-img", to: "i18n-img", required: false },
  { from: "ox-img", to: "ox-img", required: false },
  { from: "subping-img", to: "subping-img", required: false },
  { from: "privacy", to: "privacy", required: false },
  { from: "terms", to: "terms", required: true },
  { from: "oxmonth", to: "oxmonth", required: false },
  { from: "subping", to: "subping", required: false },
];

const PUBLISH_ROOT_OPTIONAL = ["CNAME", ".nojekyll"];

const ALL_PUBLISH_ROOT_FILES = [...PUBLISH_ROOT_CORE, ...PUBLISH_ROOT_IMAGES];

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

  for (const name of PUBLISH_ROOT_CORE) {
    const src = path.join(ROOT, name);
    if (!fs.existsSync(src)) {
      console.error(`publish-site: missing root core file ${name}`);
      process.exit(1);
    }
    fs.copyFileSync(src, path.join(OUT, name));
  }

  for (const name of PUBLISH_ROOT_IMAGES) {
    const src = path.join(ROOT, name);
    if (!copyFileIfExists(src, path.join(OUT, name))) {
      console.error(`publish-site: missing root image ${name}`);
      process.exit(1);
    }
  }

  for (const lang of LANGS) {
    const src = path.join(ROOT, lang);
    if (!fs.statSync(src).isDirectory()) {
      console.error(`publish-site: missing language dir ${lang}/`);
      process.exit(1);
    }
    copyDir(src, path.join(OUT, lang));
  }

  for (const { from, to, required } of PUBLISH_COPY_DIRS) {
    const src = path.join(ROOT, from);
    const dest = path.join(OUT, to);
    if (!fs.existsSync(src)) {
      if (required) {
        console.error(`publish-site: missing required dir ${from}/`);
        process.exit(1);
      }
      continue;
    }
    copyDir(src, dest);
  }

  for (const name of PUBLISH_ROOT_OPTIONAL) {
    copyFileIfExists(path.join(ROOT, name), path.join(OUT, name));
  }
}

function verify() {
  const required = [
    ...ALL_PUBLISH_ROOT_FILES.map((f) => path.join(OUT, f)),
    path.join(OUT, "ox-img", "ox-month-panels.png"),
    path.join(OUT, "locales", "en.json"),
  ];
  for (const lang of LANGS) {
    required.push(
      path.join(OUT, lang, "index.html"),
      path.join(OUT, lang, "privacy", "index.html"),
      path.join(OUT, lang, "terms", "index.html"),
      path.join(OUT, lang, "oxmonth", "delete-account", "index.html"),
      path.join(OUT, lang, "subping", "delete-account", "index.html")
    );
  }
  required.push(path.join(OUT, "privacy", "index.html"));
  required.push(path.join(OUT, "terms", "index.html"));
  required.push(path.join(OUT, "oxmonth", "delete-account", "index.html"));
  required.push(path.join(OUT, "subping", "delete-account", "index.html"));
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
