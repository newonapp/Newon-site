#!/usr/bin/env node
/** Thin wrapper: full FitOn locales live in apply-fiton-locales.mjs */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [path.join(dir, "apply-fiton-locales.mjs")], {
  cwd: path.join(dir, ".."),
  stdio: "inherit",
});
process.exit(r.status ?? 1);
