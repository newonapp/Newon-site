#!/usr/bin/env node
/**
 * Opens a URL in Cursor/VS Code Simple Browser (embedded preview).
 * - Auto-detects port: 8765 (npm run browse) first, then 8899–8910 (serve).
 * - Or pass a full URL: node scripts/open-simple-browser.mjs http://127.0.0.1:8765/ko/
 */
import http from "node:http";
import { execSync, spawnSync } from "node:child_process";
import process from "node:process";

function probePort(port) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://127.0.0.1:${port}/ko/`,
      { timeout: 500 },
      (res) => {
        res.resume();
        resolve(res.statusCode != null && res.statusCode < 500);
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function findPort() {
  for (let p = 8765; p <= 8820; p++) {
    if (await probePort(p)) return p;
  }
  for (let p = 8899; p <= 8910; p++) {
    if (await probePort(p)) return p;
  }
  return null;
}

function simpleBrowserUris(pageUrl) {
  const q = encodeURIComponent(pageUrl);
  return [
    `cursor://vscode.simple-browser/show?url=${q}`,
    `vscode://vscode.simple-browser/show?url=${q}`,
  ];
}

function openOnDarwin(uri) {
  try {
    execSync(`open -a Cursor ${JSON.stringify(uri)}`, { stdio: "pipe" });
    return true;
  } catch {
    try {
      execSync(`open ${JSON.stringify(uri)}`, { stdio: "pipe" });
      return true;
    } catch {
      return false;
    }
  }
}

function openOnOther(uri) {
  const platform = process.platform;
  try {
    if (platform === "win32") {
      spawnSync("cmd", ["/c", "start", "", uri], { stdio: "pipe", shell: false });
    } else {
      execSync(`xdg-open ${JSON.stringify(uri)}`, { stdio: "pipe" });
    }
    return true;
  } catch {
    return false;
  }
}

function openUri(uri) {
  if (process.platform === "darwin") return openOnDarwin(uri);
  return openOnOther(uri);
}

async function main() {
  const arg = process.argv[2];
  let pageUrl;

  if (arg && /^https?:\/\//i.test(arg)) {
    pageUrl = arg;
  } else {
    const pathArg = arg || "/ko/";
    const port = await findPort();
    if (port == null) {
      console.error("\n  로컬 미리보기 서버가 없습니다. 먼저 다른 터미널에서:\n");
      console.error("  npm run browse\n");
      console.error("  (포트가 꼬였으면: lsof -i :8765 로 프로세스 확인 후 종료)\n");
      process.exit(1);
    }
    pageUrl = `http://127.0.0.1:${port}${pathArg.startsWith("/") ? pathArg : `/${pathArg}`}`;
  }

  for (const uri of simpleBrowserUris(pageUrl)) {
    if (openUri(uri)) {
      console.log(`\n  Cursor Simple Browser로 열었습니다: ${pageUrl}\n`);
      return;
    }
  }

  console.error("\n  자동으로 열지 못했습니다. 아래 순서로 수동 실행해 주세요:\n");
  console.error('  1) Cmd+Shift+P (Mac) / Ctrl+Shift+P (Win)\n');
  console.error('  2) "Simple Browser: Show" 입력 후 선택\n');
  console.error(`  3) 주소: ${pageUrl}\n`);
  process.exit(1);
}

main();
