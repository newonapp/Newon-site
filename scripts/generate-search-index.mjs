#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, SITE_ORIGIN, ROOT, loadJson, flatten, fillMissing, pick } from "./hub-utils.mjs";
import { TOOLS } from "./tools-data.mjs";
import { allProducts } from "./products-data.mjs";
import { buildSearchIndex } from "./resources-data.mjs";
import { RESOURCE_PAGES } from "./resources-catalog.mjs";

const items = [];

for (const lang of LANGS) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  const flat = flatten(loc);
  const flatEn = flatten(en);

  for (const p of allProducts(lang.dir)) {
    items.push({
      title: p.name,
      desc: p.tagline || "",
      type: p.type,
      url: `${SITE_ORIGIN}/${lang.dir}/${p.type === "apps" ? "" : p.type + "/"}${p.homeHash ? "" : ""}`.replace(/\/$/, "/") + (p.homeHash || (p.slug === "404-human" ? "404-human/" : "products/")),
      lang: lang.dir,
      featured: p.featured,
      tags: [p.type, p.status],
    });
    if (p.homeHash) items[items.length - 1].url = `${SITE_ORIGIN}/${lang.dir}/${p.homeHash}`;
    if (p.slug === "404-human") items[items.length - 1].url = `${SITE_ORIGIN}/${lang.dir}/404-human/`;
  }

  for (const tool of TOOLS) {
    const building = tool.status === "building" || tool.status === "coming_soon";
    items.push({
      title: pick(flat, flatEn, tool.nameKey),
      desc: pick(flat, flatEn, tool.descKey),
      type: "tools",
      url: `${SITE_ORIGIN}/${lang.dir}/tools/${tool.slug}/`,
      lang: lang.dir,
      featured: false,
      tags: ["tools", tool.category, tool.status, building ? "coming soon" : "live"],
    });
  }

  for (const hub of ["products", "ai", "saas", "games", "business", "tools"]) {
    items.push({
      title: hub,
      type: "page",
      url: `${SITE_ORIGIN}/${lang.dir}/${hub}/`,
      lang: lang.dir,
      featured: hub === "products" || hub === "business",
      tags: [hub],
    });
  }

  items.push({
    title: pick(flat, flatEn, "nav.resources", "Resources"),
    type: "page",
    url: `${SITE_ORIGIN}/${lang.dir}/resources/`,
    lang: lang.dir,
    featured: true,
    tags: ["resources"],
  });

  for (const page of RESOURCE_PAGES) {
    items.push({
      title: page.slug,
      type: "page",
      url: `${SITE_ORIGIN}/${lang.dir}/resources/${page.slug}/`,
      lang: lang.dir,
      featured: page.slug === "store" || page.slug === "labs",
      tags: ["resources", page.slug],
    });
  }

  for (const entry of buildSearchIndex(lang.dir === "ko" ? "ko" : "en")) {
    items.push({
      title: entry.title,
      desc: entry.description || "",
      type: entry.type || "resources",
      url: `${SITE_ORIGIN}/${lang.dir}/resources/${entry.url}`,
      lang: lang.dir,
      featured: false,
      tags: entry.tags || [entry.type, entry.category].filter(Boolean),
    });
  }
}

fs.writeFileSync(path.join(ROOT, "search-index.json"), JSON.stringify(items, null, 2));
console.log("search-index.json:", items.length, "entries");
