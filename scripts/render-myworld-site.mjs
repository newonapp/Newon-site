#!/usr/bin/env node
/**
 * Render the MY WORLD business site: /{lang}/myworld/ + platform/business/partnerships/contact.
 * Never touches /{lang}/myworld/delete-account/ (app account-deletion page) or any other page.
 * Usage: node scripts/render-myworld-site.mjs [--no-sitemap]
 */
import fs from "fs";
import path from "path";
import {
  ROOT,
  LANGS,
  OG_LOCALE,
  SITE_ORIGIN,
  loadJson,
  flatten,
  fillMissing,
  applyTemplate,
  hreflangBlock,
  ensureDir,
  escapeHtml,
  pick,
  fontLinksHtml,
} from "./hub-utils.mjs";
import { clampSeoDescription } from "./seo-meta.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";
import { getMyWorldSiteCopy, MYWORLD_PAGES, myworldPagePath } from "./myworld-site-copy.mjs";
import { renderMyWorldSitePage } from "./myworld-site-body.mjs";
import { FLAGSHIP_SUBNAV_CSS } from "./flagship-subnav.mjs";
import { toUnifiedContact } from "./unified-contact-links.mjs";
import { BIZ_CONTACT_CSS } from "./biz-contact-kit.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const MWS_VER = "20261026v3";
const LASTMOD = "2026-10-18";

function localeFlat(lang) {
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en) };
}

function renderPage(lang, page) {
  const { flat, flatEn } = localeFlat(lang);
  const site = getMyWorldSiteCopy(lang.dir);
  const seo = site.copy.seo[page];
  const rel = myworldPagePath(page).replace(/\/$/, "");
  const header = renderStudioHeader(flat, flatEn, { activeNav: "", base: "./", langDir: lang.dir });
  const footer = renderStudioFooter(flat, flatEn, { base: "./", langDir: lang.dir });
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    LANG_DIR: lang.dir,
    FONT_LINKS: fontLinksHtml(lang.dir),
    TITLE: escapeHtml(seo.title),
    META_DESCRIPTION: escapeHtml(clampSeoDescription(seo.description)),
    CANONICAL: `${SITE_ORIGIN}/${lang.dir}/${rel}/`,
    OG_LOCALE: OG_LOCALE[lang.dir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(rel),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: toUnifiedContact(renderMyWorldSitePage(lang.dir, page, site), lang.dir, "myworld", page),
    CHROME_FOOTER: footer,
    EXTRA_CSS: `<link rel="stylesheet" href="/home-lifestage.css?v=20261019rest1" />
    <link rel="stylesheet" href="/home-lifestage-layout.css?v=20261025ov1" />
    <link rel="stylesheet" href="${FLAGSHIP_SUBNAV_CSS}" />
    <link rel="stylesheet" href="/myworld-site.css?v=20261026v3" />${page === "contact" ? `\n    <link rel="stylesheet" href="${BIZ_CONTACT_CSS}" />` : ""}`,
    EXTRA_SCRIPTS: `<script src="/film-keep.js?v=20260924play2"></script>
    <script src="/home-lifestage.js?v=20261025ov1" defer></script>
    <script src="/myworld-site.js?v=${MWS_VER}" defer></script>`,
  });
  const out = path.join(ROOT, lang.dir, rel, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
  return `/${lang.dir}/${rel}/`;
}

/** Root redirect for /myworld/<page>/ — only writes index.html files that are ours (never delete-account). */
function writeRootRedirect(rel) {
  const file = path.join(ROOT, rel, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="robots" content="noindex" />
<meta http-equiv="refresh" content="0;url=/ko/${rel}/" />
<link rel="canonical" href="${SITE_ORIGIN}/ko/${rel}/" />
<script>
(function(){
  var LANGS=["ko","en","ja","es","pt-br","fr","de","hi","id"];
  var pref="ko";
  try{var s=localStorage.getItem("newon-lang-dir");if(s&&LANGS.indexOf(s)!==-1)pref=s;}catch(e){}
  location.replace("/"+pref+"/${rel}/");
})();
</script>
<title>MY WORLD</title>
</head>
<body><p><a href="/ko/${rel}/">MY WORLD</a></p></body>
</html>`
  );
}

function patchSitemap(urls) {
  const file = path.join(ROOT, "sitemap.xml");
  let xml = fs.readFileSync(file, "utf8");
  const add = urls
    .filter((u) => !xml.includes(`<loc>${SITE_ORIGIN}${u}</loc>`))
    .map(
      (u) => `  <url>
    <loc>${SITE_ORIGIN}${u}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.endsWith("/myworld/") ? "0.7" : "0.6"}</priority>
  </url>
`
    )
    .join("");
  if (!add) return 0;
  xml = xml.replace("</urlset>", `${add}</urlset>`);
  fs.writeFileSync(file, xml);
  return add.split("<url>").length - 1;
}

const urls = [];
for (const page of MYWORLD_PAGES) {
  writeRootRedirect(myworldPagePath(page).replace(/\/$/, ""));
  for (const lang of LANGS) urls.push(renderPage(lang, page));
}
const added = process.argv.includes("--no-sitemap") ? 0 : patchSitemap(urls);
console.log(`render-myworld-site: ${urls.length} pages, sitemap +${added}`);
