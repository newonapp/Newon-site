#!/usr/bin/env node
/**
 * LIVON 오늘의 발견 — static route stubs for direct URLs (same strategy as Life Stage).
 *   /livon/today/{id}/  → unique title/description/canonical/OG → redirects to /livon/#today/{id}
 *   node scripts/render-livon-today-routes.mjs --out _publish/livon
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { stubHtml } from "./render-livon-life-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

export function loadTodayContents() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "livon", "today-data.js"), "utf8"), ctx);
  return (ctx.window.LivonTodayData && ctx.window.LivonTodayData.contents) || [];
}

export function buildTodayRoutes(contents) {
  return [
    { dir: "today", title: "오늘의 발견 | LivOn", description: "생활 정보·라이프 스테이지·장소·클래스·공식 지원 정보를 매일 새롭게 발견하세요.", pathName: "/livon/today/", hash: "#today" },
    /* LIVON Next V1 integration: a record on review hold (publishStatus other than "published") gets no static page —
       its title and description are not published until it is re-checked */
    ...contents.filter((c) => !c.publishStatus || c.publishStatus === "published").map((c) => ({ dir: `today/${c.id}`, title: `${c.title} · 오늘의 발견 | LivOn`, description: c.blurb, pathName: `/livon/today/${c.id}/`, hash: `#today/${c.id}` })),
  ];
}

function main() {
  const i = process.argv.indexOf("--out");
  const out = path.resolve(ROOT, i > 0 ? process.argv[i + 1] : "_publish/livon");
  const routes = buildTodayRoutes(loadTodayContents());
  const seen = new Set();
  for (const r of routes) {
    if (!/^today(\/[a-z0-9-]+)?$/.test(r.dir)) throw new Error(`unsafe route dir: ${r.dir}`);
    if (seen.has(r.dir)) throw new Error(`duplicate route: ${r.dir}`);
    seen.add(r.dir);
    fs.mkdirSync(path.join(out, r.dir), { recursive: true });
    fs.writeFileSync(path.join(out, r.dir, "index.html"), stubHtml(r));
  }
  console.log(`render-livon-today-routes: ${routes.length} pages → ${path.relative(ROOT, out)}/today/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
