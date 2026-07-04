#!/usr/bin/env node
/** Apply templates/index.html structural patches before i18n build (idempotent refresh). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

/** Only idempotent app-section patches — nav patches fail if already applied. */
const STEPS = [
  "gen-newon-plus-app-inc.mjs",
  "patch-index-goalup-app.mjs",
  "patch-index-countup-app.mjs",
  "patch-index-newon-plus-app.mjs",
  "patch-index-noting-app.mjs",
  "patch-index-newon-plus-nav.mjs",
  "patch-index-late-app-js.mjs",
];

for (const name of STEPS) {
  const script = path.join(__dirname, name);
  if (!fs.existsSync(script)) {
    console.warn(`run-index-patches: skip missing ${name}`);
    continue;
  }
  console.log(`\n→ ${name}`);
  const r = spawnSync(process.execPath, [script], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("\nrun-index-patches: OK");
