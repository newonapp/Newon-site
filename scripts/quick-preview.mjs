#!/usr/bin/env node
/**
 * Publishes _publish/, serves with serve-publish.mjs (PORT 8765~, 빈 포트 자동 선택),
 * opens the system default browser to /ko/. Stop with Ctrl+C.
 */
import { spawn, execSync } from "node:child_process";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function probeKo(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/ko/`, { timeout: 400 }, (res) => {
      res.resume();
      resolve(res.statusCode != null && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

/** serve-publish는 8765부터 자동으로 다음 포트를 씀 */
async function waitForServer() {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    for (let p = 8765; p <= 8820; p++) {
      if (await probeKo(p)) return p;
    }
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error("서버가 뜨지 않았습니다.");
}

function openSystemBrowser(url) {
  const platform = process.platform;
  if (platform === "darwin") execSync(`open ${JSON.stringify(url)}`, { stdio: "inherit" });
  else if (platform === "win32") {
    execSync(`cmd /c start "" ${JSON.stringify(url)}`, { stdio: "inherit" });
  } else {
    execSync(`xdg-open ${JSON.stringify(url)}`, { stdio: "inherit" });
  }
}

async function main() {
  execSync("node scripts/publish-site.mjs", { cwd: ROOT, stdio: "inherit" });

  const child = spawn("node", ["scripts/serve-publish.mjs"], {
    cwd: ROOT,
    env: { ...process.env, PORT: "8765" },
    stdio: "inherit",
    shell: false,
  });

  child.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  let port;
  try {
    port = await waitForServer();
  } catch (e) {
    console.error(e.message || e);
    child.kill("SIGINT");
    process.exit(1);
  }

  const url = `http://127.0.0.1:${port}/ko/`;
  openSystemBrowser(url);
  console.log(`\n  브라우저에서 열었습니다: ${url}`);
  console.log("  Cursor Simple Browser는: npm run open:cursor (서버 켜진 상태)");
  console.log("  서버 끄려면 이 터미널에서 Ctrl+C\n");

  await new Promise((resolve) => {
    child.on("exit", resolve);
    process.on("SIGINT", () => {
      child.kill("SIGINT");
    });
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
