#!/usr/bin/env node
/**
 * LIVON Life Stage — static route stubs for direct URLs.
 *
 * GitHub Pages cannot rewrite /livon/life/20s/first-independence/ to the SPA,
 * so for every stage / topic in livon/life-topics.json we emit a tiny page with
 * its own <title>, description, canonical and Open Graph tags that forwards to
 * the in-app hash route (/livon/#life/20s/first-independence).
 *
 *   node scripts/render-livon-life-routes.mjs --out _publish/livon
 *
 * Output goes to <out>/life/... (generated at publish time, not committed).
 * robots stays "noindex, follow" while /livon/ itself is noindex (pre-launch).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SITE = "https://www.newon.app";
const ROBOTS = "noindex, follow";

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function stubHtml({ title, description, pathName, hash }) {
  const canonical = SITE + pathName;
  const target = "/livon/" + hash;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="robots" content="${ROBOTS}" />
<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="LivOn" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(canonical)}" />
<meta property="og:image" content="${SITE}/assets/livon-mark.jpg" />
<meta name="twitter:card" content="summary" />
<link rel="icon" href="/assets/livon-mark.jpg" type="image/jpeg" />
<meta http-equiv="refresh" content="0; url=${esc(target)}" />
<script>location.replace(${JSON.stringify(target)});</script>
<style>body{font-family:"Noto Sans KR",system-ui,sans-serif;margin:0;padding:3rem 1.25rem;color:#171717}a{color:#0a0a0a}</style>
</head>
<body>
<main>
<p>LIVON 라이프 스테이지</p>
<h1>${esc(title.split(" | ")[0])}</h1>
<p>${esc(description)}</p>
<p><a href="${esc(target)}">LIVON에서 보기</a></p>
</main>
</body>
</html>
`;
}

export function buildRoutes(data) {
  const routes = [];
  routes.push({
    dir: "life",
    title: "라이프 스테이지 | LivOn",
    description: "10대부터 70대 이후까지, 생애 단계별 주제·가이드·체크리스트와 관련 정보를 살펴보세요.",
    pathName: "/livon/life/",
    hash: "#life",
  });
  for (const s of data.stages) {
    routes.push({
      dir: `life/${s.slug}`,
      title: `${s.label} 라이프 스테이지 · ${s.title} | LivOn`,
      description: `${s.heroTitle} ${s.heroLead}`.trim(),
      pathName: `/livon/life/${s.slug}/`,
      hash: `#life/${s.slug}`,
    });
  }
  for (const t of data.topics) {
    const s = data.stages.find((x) => x.id === t.lifeStageId);
    routes.push({
      dir: `life/${t.stageSlug}/${t.slug}`,
      title: `${t.title} · ${s ? s.label : ""} 라이프 스테이지 | LivOn`,
      description: t.description,
      pathName: `/livon/life/${t.stageSlug}/${t.slug}/`,
      hash: `#life/${t.stageSlug}/${t.slug}`,
    });
  }
  return routes;
}

function main() {
  const i = process.argv.indexOf("--out");
  const out = path.resolve(ROOT, i > 0 ? process.argv[i + 1] : "_publish/livon");
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, "livon", "life-topics.json"), "utf8"));
  const routes = buildRoutes(data);
  const seen = new Set();
  for (const r of routes) {
    if (!/^life(\/[a-z0-9-]+){0,2}$/.test(r.dir)) throw new Error(`unsafe route dir: ${r.dir}`);
    if (seen.has(r.dir)) throw new Error(`duplicate route: ${r.dir}`);
    seen.add(r.dir);
    const dir = path.join(out, r.dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), stubHtml(r));
  }
  console.log(`render-livon-life-routes: ${routes.length} pages → ${path.relative(ROOT, out)}/life/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
