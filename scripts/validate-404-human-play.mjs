#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const gameRoot = path.join(root, "404-human", "play");
const required = [
  "index.html",
  "flutter.js",
  "flutter_bootstrap.js",
  "flutter_service_worker.js",
  "main.dart.js",
  "manifest.json",
  "version.json",
  "assets/AssetManifest.bin.json",
  "assets/FontManifest.json",
  "canvaskit/canvaskit.js",
  "canvaskit/canvaskit.wasm",
  "canvaskit/skwasm.js",
  "canvaskit/skwasm.wasm",
  "icons/Icon-192.png",
  "icons/Icon-512.png",
];

for (const relative of required) {
  if (!fs.existsSync(path.join(gameRoot, relative))) {
    throw new Error(`Missing 404: HUMAN web asset: ${relative}`);
  }
}

const index = fs.readFileSync(path.join(gameRoot, "index.html"), "utf8");
if (!index.includes('<base href="/404-human/play/">')) {
  throw new Error("Flutter base href must be /404-human/play/");
}
if (!index.includes('src="flutter_bootstrap.js"')) {
  throw new Error("Flutter bootstrap must remain relative to the game base path");
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(gameRoot, "manifest.json"), "utf8"),
);
if (manifest.start_url !== ".") {
  throw new Error('Game manifest start_url must remain "." for subpath hosting');
}

const fonts = JSON.parse(
  fs.readFileSync(path.join(gameRoot, "assets", "FontManifest.json"), "utf8"),
);
for (const family of fonts) {
  for (const font of family.fonts || []) {
    const fontPath = path.join(gameRoot, "assets", font.asset);
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font manifest points to a missing asset: ${font.asset}`);
    }
  }
}

const config = fs.readFileSync(
  path.join(root, "404-human", "play-config.js"),
  "utf8",
);
if (!config.includes('PLAY_GAME_URL: "/404-human/play/"')) {
  throw new Error("404: HUMAN CTA must target the same-origin game route");
}
if (!config.includes('STATUS: "RELEASED"')) {
  throw new Error("404: HUMAN page status must be RELEASED");
}

console.log("validate-404-human-play: OK");
