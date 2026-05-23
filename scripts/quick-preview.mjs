#!/usr/bin/env node
/**
 * Publishes _publish/, serves with serve-publish.mjs (PORT 8765~, 빈 포트 자동 선택),
 * opens the system default browser to /ko/. Stop with Ctrl+C.
 */
import { spawn, execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * 이전에 띄운 serve-publish가 8765에 남아 있으면, 새 프로세스는 8766+로 붙는다.
 * 포트만 스캔하면 “옛 서버”를 잡아 브라우저가 stale _publish를 보게 되므로,
 * 자식 stdout의 __NEWON_SERVE_PORT__ 로 실제 포트를 읽는다.
 */
async function waitForServePortFromChild(child) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + 25000;
    let buf = "";
    const onData = (chunk) => {
      buf += chunk.toString("utf8");
      const m = buf.match(/__NEWON_SERVE_PORT__\s+(\d+)/);
      if (m) {
        cleanup();
        resolve(Number(m[1], 10));
      }
    };
    const tick = () => {
      if (Date.now() > deadline) {
        cleanup();
        reject(new Error("서버가 뜨지 않았습니다(__NEWON_SERVE_PORT__ 타임아웃)."));
      }
    };
    const interval = setInterval(tick, 150);
    function cleanup() {
      clearInterval(interval);
      if (child.stdout) child.stdout.removeListener("data", onData);
    }
    if (!child.stdout) {
      clearInterval(interval);
      reject(new Error("serve-publish stdout을 읽을 수 없습니다."));
      return;
    }
    child.stdout.on("data", onData);
    tick();
  });
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
    stdio: ["inherit", "pipe", "inherit"],
    shell: false,
  });

  child.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
  });

  let port;
  try {
    port = await waitForServePortFromChild(child);
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
