#!/usr/bin/env node
/**
 * Export all Newon app logos as saveable PNG icon files.
 *
 *   node scripts/export-app-icons.mjs
 *
 * Output: app-icons/<slug>/icon-1024.png (+ icon-512, icon-256, icon-128)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "app-icons");

const SIZES = [1024, 512, 256, 128];

const APPS = [
  { slug: "newon", name: "Newon", src: "logo.png" },
  { slug: "ox-month", name: "OX MONTH", src: "ox-month-logo.png" },
  { slug: "subping", name: "SubPing", src: "subping-logo.png" },
  { slug: "pillmate", name: "Pillmate", src: "pillmate-logo.png" },
  { slug: "savy", name: "SAVY", src: "savy-logo.png" },
  { slug: "babylog", name: "BabyLog", src: "babylog-logo.png" },
  { slug: "petlog", name: "PetLog", src: "petlog-logo.png" },
  { slug: "piggyup", name: "PiggyUp", src: "piggyup-logo.png" },
  { slug: "goalup", name: "GoalUp", src: "goalup-logo.png" },
  { slug: "countup", name: "CountUp", src: "countup-logo.png" },
  { slug: "newon-plus", name: "Newon+", src: "newon-plus-logo.png" },
  { slug: "noting", name: "Noting", src: "noting-logo.png" },
];

function resizePng(src, dest, size) {
  const r = spawnSync("sips", ["-s", "format", "png", "-z", String(size), String(size), src, "--out", dest], {
    stdio: "pipe",
  });
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || "").toString().trim();
    throw new Error(`sips failed for ${dest}: ${err}`);
  }
}

function exportApp({ slug, name, src }) {
  const input = path.join(ROOT, src);
  if (!fs.existsSync(input)) {
    console.error(`export-app-icons: missing source ${src}`);
    process.exit(1);
  }

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });

  for (const size of SIZES) {
    const outFile = path.join(dir, `icon-${size}.png`);
    resizePng(input, outFile, size);
  }

  return { slug, name, src, sizes: SIZES };
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const apps = APPS.map(exportApp);

const brandDir = path.join(OUT, "newon-brand");
fs.mkdirSync(brandDir, { recursive: true });
resizePng(path.join(ROOT, "apple-touch-icon.png"), path.join(brandDir, "icon-180.png"), 180);

const index = {
  generatedAt: new Date().toISOString(),
  apps: [
    ...apps.map(({ slug, name, src, sizes }) => ({ slug, name, source: src, sizes })),
    { slug: "newon-brand", name: "Newon (Apple touch)", source: "apple-touch-icon.png", sizes: [180] },
  ],
};
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(index, null, 2) + "\n");

console.log(`export-app-icons OK → ${path.relative(ROOT, OUT)}/`);
for (const app of APPS) {
  console.log(`  ${app.slug}/icon-1024.png  (${app.name})`);
}
