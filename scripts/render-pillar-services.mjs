#!/usr/bin/env node
/**
 * Legacy /{lang}/business/build/{slug}/ URLs → original business service detail pages.
 * (BUILD 자세히 보기 now uses /business/{mvp|web|landing|app}/ with the shared bs design.)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, SITE_ORIGIN, ROOT } from "./hub-utils.mjs";

const REDIRECTS = {
  mvp: "mvp",
  website: "web",
  landing: "landing",
  app: "app",
};

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function metaRefresh(langDir, targetSlug) {
  const target = `/${langDir}/business/${targetSlug}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=${target}" />
  <link rel="canonical" href="${SITE_ORIGIN}${target}" />
  <title>Redirect</title>
</head>
<body>
  <p><a href="${target}">Continue to service detail</a></p>
</body>
</html>
`;
}

export function renderPillarServices() {
  let count = 0;
  for (const lang of LANGS) {
    for (const [from, to] of Object.entries(REDIRECTS)) {
      const out = path.join(ROOT, lang.dir, "business", "build", from, "index.html");
      ensureDir(out);
      fs.writeFileSync(out, metaRefresh(lang.dir, to));
      count += 1;
    }
  }
  console.log(`render-pillar-services: redirected ${count} pages → business service details`);
  return count;
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  renderPillarServices();
}
