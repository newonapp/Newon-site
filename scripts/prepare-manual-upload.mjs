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
  "styles.css",
  "ox-month.css",
  "package.json",
  "upload-to-github.sh",
  "first-time-push.sh",
  "logo.png",
  "ox-month-logo.png",
  "subping-logo.png",
  "pillmate-logo.png",
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

// 1) 최신 HTML / 검증
const build = spawnSync(process.execPath, [path.join(ROOT, "scripts", "publish-site.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

// 2) 비우고 채우기
fs.rmSync(DEST, { recursive: true, force: true });
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
  ">>> 하나씩 웹 업로드 하지 마세요. GitHub Desktop 으로 한 번에 올리세요.",
  ">>> 프로젝트 폴더의  올리는법-GitHubDesktop.txt  참고 (이 pack 안에도 복사됨).",
  "",
  "=== GitHub에 올릴 파일 목록 (upload-pack 기준) ===",
  `총 ${listed.length}개 파일`,
  "",
  ...listed.map((l) => l),
  "",
  "=== 한 번에 올리기 (추천) ===",
  "1. 프로젝트 폴더에 생긴  Newon-site-upload.zip  더블클릭 → 압축 풀림",
  "2. 풀린 폴더(이름이 길면 맨 안쪽까지 들어가서) .github, index.html 보이는 그 폴더에서",
  "   Cmd+A (전체 선택)",
  "3. GitHub → newonapp/Newon-site → Add file → Upload files",
  "4. 선택한 것을 통째로 드래그 → 한 번에 올라감 (GitHub 웹 제한으로 실패하면 아래 참고)",
  "",
  "=== zip 없이 ===",
  "Finder에서 upload-pack 열고 → Cmd+A → Upload files 로 드래그",
  "",
  "=== 웹에서 막히면 ===",
  "GitHub Desktop 설치 → 저장소 클론 후 upload-pack 내용을 폴더에 붙여넣기 → Commit 전체 → Push",
  "",
  "5. Settings → Pages → Source: GitHub Actions",
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

console.log("");
console.log("준비 완료:", DEST);
console.log("목록:", path.join(DEST, "이_폴더를_GitHub에_올리세요.txt"));
console.log("");
