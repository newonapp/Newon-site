#!/usr/bin/env node
/**
 * GitHub 웹에서 "Add file → Upload files" 로 올릴 수 있게
 * upload-pack/ 폴더를 한 번에 채웁니다.
 *
 *   node scripts/prepare-manual-upload.mjs
 *
 * 같은 폴더에 Newon-site-upload.zip 생성 → 풀고 안 내용 전체를 GitHub에 한 번에 드래그
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DEST = path.join(ROOT, "upload-pack");
const ZIP_OUT = path.join(ROOT, "Newon-site-upload.zip");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const COPY_DIRS = [
  ".github",
  ".vscode",
  "templates",
  "scripts",
  "locales",
  "privacy",
  "oxmonth",
  "subping",
  "ox-img",
  "subping-img",
  "i18n-img",
  ...LANGS,
];

const COPY_FILES = [
  ".gitignore",
  "index.html",
  "lang-nav.js",
  "lang-dropdown.js",
  "styles.css",
  "ox-month.css",
  "package.json",
  "upload-to-github.sh",
  "first-time-push.sh",
  "logo.png",
  "ox-month-logo.png",
  "subping-logo.png",
  "pillmate-logo.png",
  "savy-logo.png",
  "babylog-logo.png",
  "petlog-logo.png",
  "subping-hero-mark.png",
  "feature-grid.png",
  "hero-promo.png",
  "step-add-habit.png",
  "step-daily-check.png",
  "step-stats.png",
  "CNAME",
  ".nojekyll",
  "vercel.json",
  "netlify.toml",
  "README.md",
  "GitHub에-파일로-올리기.txt",
  "올리는법-GitHubDesktop.txt",
  "업로드-체크리스트.txt",
  "복사해서-터미널에-붙여넣기.txt",
  "올리기.command",
  "올리기-처음만-강제.command",
];

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
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function walkFiles(dir, base, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const rel = path.join(base, ent.name);
    if (ent.isDirectory()) walkFiles(full, rel, out);
    else out.push(rel.split(path.sep).join("/"));
  }
}

/** macOS에서 upload-pack 재생성 시 ENOTEMPTY 가 나는 경우 대비 */
function rmDirForce(dir) {
  if (!fs.existsSync(dir)) return;
  for (let i = 0; i < 5; i++) {
    spawnSync("rm", ["-rf", dir]);
    if (!fs.existsSync(dir)) return;
    try {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 300 });
    } catch {
      /* retry */
    }
    if (!fs.existsSync(dir)) return;
    spawnSync("sleep", ["0.3"]);
  }
  if (fs.existsSync(dir)) {
    throw new Error(`폴더를 비울 수 없습니다: ${dir}\n터미널: rm -rf "${dir}"`);
  }
}

// 1) 최신 HTML / 검증
const build = spawnSync(process.execPath, [path.join(ROOT, "scripts", "publish-site.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

// 2) 비우고 채우기
rmDirForce(DEST);
fs.mkdirSync(DEST, { recursive: true });

for (const name of COPY_DIRS) {
  const src = path.join(ROOT, name);
  if (!fs.existsSync(src)) {
    console.warn("skip (없음):", name);
    continue;
  }
  copyDir(src, path.join(DEST, name));
}

for (const name of COPY_FILES) {
  copyFileIfExists(path.join(ROOT, name), path.join(DEST, name));
}

for (const cmd of ["올리기.command", "올리기-처음만-강제.command"]) {
  const p = path.join(DEST, cmd);
  if (fs.existsSync(p)) fs.chmodSync(p, 0o755);
}

// 3) 파일 목록
const listed = [];
walkFiles(DEST, "", listed);
listed.sort();
const manifest = [
  "================================================================================",
  "  이 폴더(또는 Newon-site-upload.zip 을 푼 내용)를 GitHub에 올리세요",
  "  저장소: https://github.com/newonapp/Newon-site",
  "================================================================================",
  "",
  "【가장 쉬움】 GitHub Desktop",
  "  1) desktop.github.com 설치 → Newon-site Clone",
  "  2) 상위 폴더의 Newon-site-upload.zip 풀기",
  "  3) 풀린 것 전체를 Clone 폴더에 드래그(덮어쓰기) → Commit → Push",
  "",
  "【터미널로 zip 다시 만들기】",
  "  cd /Users/kyungnawon/Newon && npm run 묶기",
  "",
  "【자세한 글】 GitHub에-파일로-올리기.txt (프로젝트·이 pack 안)",
  "",
  `=== 포함 파일 (${listed.length}개) ===`,
  "",
  ...listed.map((l) => l),
  "",
  "=== Pages 설정 (한 번만) ===",
  "  Settings → Pages → Source: GitHub Actions",
  "  Custom domain: www.newon.app",
  "",
];
fs.writeFileSync(path.join(DEST, "이_폴더를_GitHub에_올리세요.txt"), manifest.join("\n"), "utf8");

// 4) 단일 zip (압축 풀고 전체 선택 → 한 번 드래그)
try {
  fs.rmSync(ZIP_OUT, { force: true });
} catch {
  /* ignore */
}
const z = spawnSync("zip", ["-r", "-q", ZIP_OUT, ".", "-x", ".DS_Store"], {
  cwd: DEST,
  stdio: "inherit",
});
if (z.status !== 0) {
  console.warn("zip 명령 실패 (맥에 기본 내장). upload-pack 폴더만 사용하세요.");
} else {
  const st = fs.statSync(ZIP_OUT);
  console.log("ZIP:", ZIP_OUT, `(${(st.size / 1024 / 1024).toFixed(2)} MB)`);
}

if (process.platform === "darwin") {
  if (fs.existsSync(ZIP_OUT)) spawnSync("open", ["-R", ZIP_OUT]);
  else spawnSync("open", [DEST]);
}

console.log("");
console.log("준비 완료");
console.log("  ZIP:     ", ZIP_OUT);
console.log("  폴더:    ", DEST);
console.log("  안내:    ", path.join(ROOT, "GitHub에-파일로-올리기.txt"));
console.log("");
console.log("다음: zip 풀기 → GitHub Desktop 으로 Clone 폴더에 붙여넣기 → Push");
console.log("(웹 Upload files 는 파일이 많아 실패할 수 있음)");
console.log("");
