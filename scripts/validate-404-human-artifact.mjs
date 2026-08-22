#!/usr/bin/env node
/**
 * Validate the Pages artifact (_publish) contains a complete Flutter Web game.
 * Fails the workflow if the final deploy folder is missing the play route.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const artifactRoot = process.env.PAGES_ARTIFACT_DIR
  ? path.resolve(process.env.PAGES_ARTIFACT_DIR)
  : path.join(root, "_publish");
const gameRoot = path.join(artifactRoot, "404-human", "play");

const required = [
  { rel: "index.html", minBytes: 500 },
  { rel: "flutter.js", minBytes: 1000 },
  { rel: "flutter_bootstrap.js", minBytes: 1000 },
  { rel: "flutter_service_worker.js", minBytes: 100 },
  { rel: "main.dart.js", minBytes: 500_000 },
  { rel: "manifest.json", minBytes: 50 },
  { rel: "version.json", minBytes: 20 },
  { rel: "assets/AssetManifest.bin.json", minBytes: 10 },
  { rel: "assets/FontManifest.json", minBytes: 10 },
  { rel: "canvaskit/canvaskit.js", minBytes: 1000 },
  { rel: "canvaskit/canvaskit.wasm", minBytes: 1_000_000 },
  { rel: "icons/Icon-192.png", minBytes: 100 },
];

if (!fs.existsSync(gameRoot)) {
  throw new Error(
    `Pages artifact is missing game directory: ${path.relative(root, gameRoot)}`,
  );
}

for (const { rel, minBytes } of required) {
  const filePath = path.join(gameRoot, rel);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pages artifact missing: 404-human/play/${rel}`);
  }
  const size = fs.statSync(filePath).size;
  if (size < minBytes) {
    throw new Error(
      `Pages artifact file too small (${size} < ${minBytes}): 404-human/play/${rel}`,
    );
  }
}

const index = fs.readFileSync(path.join(gameRoot, "index.html"), "utf8");
if (!index.includes('<base href="/404-human/play/">')) {
  throw new Error("Artifact game index.html has wrong base href");
}

const wasm = fs.readFileSync(path.join(gameRoot, "canvaskit", "canvaskit.wasm"));
if (wasm[0] !== 0x00 || wasm[1] !== 0x61 || wasm[2] !== 0x73 || wasm[3] !== 0x6d) {
  throw new Error("Artifact canvaskit.wasm is not a valid WASM binary");
}

console.log(
  `validate-404-human-artifact: OK (${path.relative(root, gameRoot)})`,
);
