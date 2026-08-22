#!/usr/bin/env node
/**
 * Post-deploy smoke test for the live 404: HUMAN game route.
 * Retries while GitHub Pages / CDN propagates.
 */
const ORIGIN = process.env.NEWON_SITE_ORIGIN || "https://www.newon.app";
const PLAY = "/404-human/play/";
const MAX_ATTEMPTS = Number(process.env.NEWON_VERIFY_ATTEMPTS || 12);
const SLEEP_MS = Number(process.env.NEWON_VERIFY_SLEEP_MS || 10000);

const gamePaths = [
  PLAY,
  `${PLAY}index.html`,
  `${PLAY}flutter.js`,
  `${PLAY}flutter_bootstrap.js`,
  `${PLAY}main.dart.js`,
  `${PLAY}manifest.json`,
  `${PLAY}assets/AssetManifest.bin.json`,
  `${PLAY}canvaskit/canvaskit.wasm`,
];

const localeRedirectPaths = ["/ko/404-human/play/", "/en/404-human/play/"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkOnce() {
  const failures = [];
  for (const p of gamePaths) {
    const url = `${ORIGIN}${p}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      failures.push(`${res.status} ${url}`);
      continue;
    }
    if (p === PLAY || p === `${PLAY}index.html`) {
      const html = await res.text();
      if (!html.includes('<base href="/404-human/play/">')) {
        failures.push(`bad base href ${url}`);
      }
    }
  }
  for (const p of localeRedirectPaths) {
    const url = `${ORIGIN}${p}`;
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      failures.push(`${res.status} ${url}`);
      continue;
    }
    const html = await res.text();
    if (!html.includes('location.replace("/404-human/play/"')) {
      failures.push(`locale play redirect missing ${url}`);
    }
  }
  return failures;
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const failures = await checkOnce();
  if (failures.length === 0) {
    console.log(`verify-production-404-human: OK (${ORIGIN}${PLAY})`);
    process.exit(0);
  }
  console.warn(
    `verify-production-404-human: attempt ${attempt}/${MAX_ATTEMPTS} failed:\n${failures.join("\n")}`,
  );
  if (attempt < MAX_ATTEMPTS) {
    await sleep(SLEEP_MS);
  }
}

process.exit(1);
