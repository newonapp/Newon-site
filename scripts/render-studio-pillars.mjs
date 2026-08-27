#!/usr/bin/env node
/**
 * Render /{lang}/studio/{brand|digital|content|ip}/ pillar detail pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml } from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { buildPillarPageBody } from "./render-business-pillars.mjs";
import { STUDIO_PILLAR_SLUGS, getStudioPillarCopy } from "./studio-pillar-copy.mjs";
import { renderStudioServiceDetails } from "./render-studio-service-details.mjs";

const template = fs.readFileSync(path.join(ROOT, "templates", "business-pillar.html"), "utf8");

const STUDIO_LABELS = { brand: "BRAND", digital: "DIGITAL", content: "CONTENT", ip: "IP" };

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function hreflangBlock(slug) {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/studio/${slug}/" />`
  );
  lines.push(`    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/studio/${slug}/" />`);
  return lines.join("\n");
}

function jsonLd(slug, copy, langDir) {
  const url = `${SITE_ORIGIN}/${langDir}/studio/${slug}/`;
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: copy.seoTitle || `Newon Studio ${slug}`,
    description: copy.metaDescription || copy.lead || "",
    provider: { "@type": "Organization", name: "Newon", url: SITE_ORIGIN },
    url,
    areaServed: "Worldwide",
  };
  const crumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Newon", item: `${SITE_ORIGIN}/${langDir}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.crumbStudio || "Studio",
        item: `${SITE_ORIGIN}/${langDir}/studio/`,
      },
      { "@type": "ListItem", position: 3, name: STUDIO_LABELS[slug] || slug.toUpperCase(), item: url },
    ],
  };
  return `    <script type="application/ld+json">${JSON.stringify(data)}</script>
    <script type="application/ld+json">${JSON.stringify(crumb)}</script>`;
}

function writeRedirect(slug) {
  const dir = path.join(ROOT, "studio", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=/en/studio/${slug}/"/><link rel="canonical" href="${SITE_ORIGIN}/en/studio/${slug}/"/><title>Redirect</title></head><body><p><a href="/en/studio/${slug}/">Continue</a></p></body></html>\n`
  );
}

export function renderStudioPillars() {
  const flatEn = flatten(loadJson("en.json"));
  const inquiryHref = "../../business/inquiry/?category=Studio#inquiry";

  for (const { dir, file, htmlLang } of LANGS) {
    const flat = flatten(loadJson(file));
    const lang = dir === "ko" ? "ko" : "en";

    for (const slug of STUDIO_PILLAR_SLUGS) {
      const copy = getStudioPillarCopy(slug, lang);
      if (!copy) continue;
      const body = buildPillarPageBody(slug, copy, lang, {
        inquiryHref,
        crumb: {
          hubLabel: copy.crumbStudio || "Studio",
          hubHref: "../",
          slugLabel: STUDIO_LABELS[slug] || slug.toUpperCase(),
        },
        other: {
          slugs: STUDIO_PILLAR_SLUGS,
          labels: STUDIO_LABELS,
          getCopy: getStudioPillarCopy,
        },
      });

      let html = template;
      html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
      html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
      html = html.replace(/\{\{CANONICAL\}\}/g, `${SITE_ORIGIN}/${dir}/studio/${slug}/`);
      html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock(slug));
      html = html.replace(/\{\{JSON_LD\}\}/g, jsonLd(slug, copy, dir));
      html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy.seoTitle || ""));
      html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(copy.metaDescription || ""));
      html = html.replace(/\{\{PILLAR_SLUG\}\}/g, slug);
      html = html.replace(/\{\{PAGE_BODY\}\}/g, body);
      html = injectSiteChrome(html, flat, flatEn, { activeNav: "studio", base: "../../" });

      const outDir = path.join(ROOT, dir, "studio", slug);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "index.html"), html);
    }
  }

  for (const slug of STUDIO_PILLAR_SLUGS) writeRedirect(slug);

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      for (const slug of STUDIO_PILLAR_SLUGS) {
        const src = path.join(ROOT, dir, "studio", slug, "index.html");
        const destDir = path.join(pub, dir, "studio", slug);
        if (!fs.existsSync(src)) continue;
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, path.join(destDir, "index.html"));
      }
    }
    for (const slug of STUDIO_PILLAR_SLUGS) {
      const src = path.join(ROOT, "studio", slug, "index.html");
      const destDir = path.join(pub, "studio", slug);
      if (!fs.existsSync(src)) continue;
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, path.join(destDir, "index.html"));
    }
  }

  console.log(`render-studio-pillars: wrote ${LANGS.length * STUDIO_PILLAR_SLUGS.length} pages`);
  renderStudioServiceDetails();
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) renderStudioPillars();
