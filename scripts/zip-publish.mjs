#!/usr/bin/env node
/**
 * 배포 트리(_publish/)만 단일 zip으로 묶습니다. (백업·다른 호스트에 zip 업로드 후 풀기·전달용)
 *
 *   node scripts/zip-publish.mjs
 *
 * GitHub Pages는 zip 파일 자체를 사이트로 서빙하지 않습니다. Actions가 _publish 내용을
 * 그대로 올리는 방식이며, 이 zip은 "한 파일로 옮기기" 중간 포맷일 뿐입니다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLISH = path.join(ROOT, "_publish");
const ZIP = path.join(ROOT, "Newon-pages.zip");

const build = spawnSync(process.execPath, [path.join(ROOT, "scripts", "publish-site.mjs")], {
  cwd: ROOT,
  stdio: "inherit",
});
if (build.status !== 0) process.exit(build.status ?? 1);

try {
  fs.rmSync(ZIP, { force: true });
} catch {
  /* ignore */
}

const z = spawnSync("zip", ["-r", "-q", ZIP, ".", "-x", ".DS_Store"], {
  cwd: PUBLISH,
  stdio: "inherit",
});
if (z.status !== 0) {
  console.error("zip 실패: macOS에는 /usr/bin/zip 이 있습니다. 수동으로 _publish 폴더를 압축하세요.");
  process.exit(z.status ?? 1);
}

const st = fs.statSync(ZIP);
console.log("");
console.log("생성:", ZIP, `(${(st.size / 1024 / 1024).toFixed(2)} MB)`);
console.log("내용: _publish/ 와 동일 (풀면 GitHub Pages에 올리는 그 구조)");
console.log("");
