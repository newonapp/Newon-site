#!/usr/bin/env node
/**
 * Vercel build entry (vercel.json buildCommand).
 *
 *   LIVON_API_ONLY=1  → API-only deployment for the LIVON backend (the public site stays on GitHub Pages).
 *                       Only a tiny static placeholder is published: no copy of the Newon site on the API domain
 *                       (no duplicate content), noindex everywhere, robots.txt disallows crawling.
 *                       The serverless functions in api/ are deployed by Vercel independently of this output.
 *   otherwise         → the full site build, exactly as before (node scripts/publish-site.mjs).
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_publish");

export function apiOnlyFiles() {
  return {
    "index.html": '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>LIVON API</title></head>' +
      '<body><p>LIVON API. 서비스는 <a href="https://www.newon.app/livon/">www.newon.app/livon</a>에서 이용할 수 있습니다.</p></body></html>\n',
    "robots.txt": "User-agent: *\nDisallow: /\n"
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.LIVON_API_ONLY === "1") {
    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, body] of Object.entries(apiOnlyFiles())) fs.writeFileSync(path.join(OUT, name), body, "utf8");
    console.log("vercel-build: LIVON API-only output → _publish (placeholder + robots)");
  } else {
    const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "publish-site.mjs")], { cwd: ROOT, stdio: "inherit", env: process.env });
    process.exit(r.status === null ? 1 : r.status);
  }
}
