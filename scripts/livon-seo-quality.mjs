#!/usr/bin/env node
/**
 * LIVON SEO quality check — verifies a built site (default: _publish) against its manifest.
 *
 *   node scripts/livon-seo-quality.mjs --root _publish        exit 1 on any error
 *
 * Checks, per page in <root>/livon/seo-manifest.json:
 *   title / description present and unique · exactly one <h1> that matches the manifest · canonical = URL ·
 *   robots meta = index policy · lang="ko" · no hreflang (no translated LIVON pages exist) · JSON-LD parses, has WebPage +
 *   BreadcrumbList that equal the visible breadcrumb, FAQPage text equals the visible text · no executable inline script ·
 *   internal links resolve to a published file · external links are https (format only — nothing is fetched) ·
 *   thin content · orphan pages · duplicate slugs · manifest ⇄ files ⇄ sitemap agree · excluded areas are absent.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { POLICY, SITE, INTENTS } from "./livon-seo-build.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const unesc = (s) => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const strip = (h) => unesc(String(h).replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const meta = (html, re) => { const m = re.exec(html); return m ? unesc(m[1]) : null; };
const fileOf = (root, p) => path.join(root, ...p.split("/").filter(Boolean), "index.html");

export function parsePage(html) {
  const main = (/<main[^>]*>([\s\S]*?)<\/main>/.exec(html) || [, ""])[1];
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return {
    lang: meta(html, /<html lang="([^"]*)"/), title: meta(html, /<title>([^<]*)<\/title>/), description: meta(html, /<meta name="description" content="([^"]*)"/),
    robots: meta(html, /<meta name="robots" content="([^"]*)"/), canonical: meta(html, /<link rel="canonical" href="([^"]*)"/),
    og: Object.fromEntries([...html.matchAll(/<meta property="og:([a-z_]+)" content="([^"]*)"/g)].map((m) => [m[1], unesc(m[2])])),
    twitter: Object.fromEntries([...html.matchAll(/<meta name="twitter:([a-z]+)" content="([^"]*)"/g)].map((m) => [m[1], unesc(m[2])])),
    h1: [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1])),
    headings: [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1])),
    links: [...html.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map((m) => unesc(m[1])),
    mainLinks: [...main.matchAll(/<a\s[^>]*href="([^"]*)"/g)].map((m) => unesc(m[1])),
    crumbs: [...((/<nav class="lv-seo-crumbs"[\s\S]*?<\/nav>/.exec(html) || [""])[0]).matchAll(/<li[^>]*>(?:<a href="([^"]*)">)?([^<]*)/g)].map((m) => ({ path: m[1] ? unesc(m[1]) : null, name: unesc(m[2]) })),
    hreflang: /hreflang=/.test(html), inlineScripts: [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>/g)].length,
    externalScripts: [...html.matchAll(/<script[^>]*\bsrc="([^"]*)"/g)].map((m) => m[1]),
    jsonld: lds, text: strip(main), mainHtml: main
  };
}

export function checkSite(root) {
  const errors = [], warnings = [];
  const err = (code, where, msg) => errors.push({ code, where, msg });
  const mfPath = path.join(root, "livon", "seo-manifest.json");
  if (!fs.existsSync(mfPath)) return { errors: [{ code: "no-manifest", where: mfPath, msg: "seo-manifest.json not found" }], warnings, stats: {} };
  const manifest = JSON.parse(fs.readFileSync(mfPath, "utf8"));
  const pages = manifest.pages, byPath = Object.fromEntries(pages.map((p) => [p.path, p]));
  const titles = new Map(), descs = new Map(), slugs = new Map(), inbound = new Map(), parsed = {};
  let thin = 0, brokenInternal = 0, externalLinks = 0;

  for (const p of pages) {
    const key = p.path.split("/").filter(Boolean).slice(0, -1).join("/") + "/" + p.slug;
    if (slugs.has(key)) err("duplicate-slug", p.path, "same slug as " + slugs.get(key)); slugs.set(key, p.path);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) err("bad-slug", p.path, p.slug);
    const f = fileOf(root, p.path);
    if (!fs.existsSync(f)) { err("missing-file", p.path, "manifest page has no index.html"); continue; }
    const html = fs.readFileSync(f, "utf8"), d = parsePage(html); parsed[p.path] = d;
    if (d.lang !== "ko") err("lang", p.path, 'html lang must be "ko"');
    if (!d.title) err("missing-title", p.path, ""); else if (d.title !== p.title) err("title-mismatch", p.path, d.title);
    if (!d.description) err("missing-description", p.path, ""); else if (d.description !== p.description) err("description-mismatch", p.path, "");
    if (d.title) { if (titles.has(d.title)) err("duplicate-title", p.path, "same as " + titles.get(d.title)); titles.set(d.title, p.path); }
    if (d.description) { if (descs.has(d.description)) err("duplicate-description", p.path, "same as " + descs.get(d.description)); descs.set(d.description, p.path); }
    if (d.title && d.title.length > 70) warnings.push({ code: "long-title", where: p.path, msg: d.title.length + " chars" });
    if (d.description && (d.description.length < 40 || d.description.length > 160)) err("description-length", p.path, d.description.length + " chars");
    if (d.h1.length === 0) err("missing-h1", p.path, ""); else if (d.h1.length > 1) err("multiple-h1", p.path, String(d.h1.length)); else if (d.h1[0] !== p.h1) err("h1-mismatch", p.path, d.h1[0]);
    for (let i = 1; i < d.headings.length; i++) if (d.headings[i] > d.headings[i - 1] + 1) err("heading-skip", p.path, "h" + d.headings[i - 1] + " → h" + d.headings[i]);
    if (!d.canonical) err("missing-canonical", p.path, ""); else if (d.canonical !== SITE + p.path || d.canonical !== p.canonical) err("canonical-mismatch", p.path, d.canonical);
    if (d.robots !== (p.index ? "index, follow" : "noindex, follow")) err("robots-mismatch", p.path, String(d.robots));
    if (d.hreflang) err("hreflang", p.path, "no translated LIVON page exists: hreflang must not be declared");
    for (const k of ["type", "title", "description", "url", "site_name", "image", "locale"]) if (!d.og[k]) err("og-missing", p.path, "og:" + k);
    if (d.og.title !== p.title || d.og.description !== p.description || d.og.url !== p.canonical) err("og-mismatch", p.path, "");
    if (d.og.image && !fs.existsSync(path.join(root, d.og.image.replace(SITE, "")))) err("og-image-missing", p.path, d.og.image);
    if (d.twitter.card !== "summary" || d.twitter.title !== p.title || d.twitter.description !== p.description) err("twitter-mismatch", p.path, "");
    if (d.inlineScripts) err("inline-script", p.path, "static pages must not carry executable inline script (CSP)");
    if (d.externalScripts.length) err("app-script", p.path, "static pages must be readable without JavaScript: " + d.externalScripts.join(","));
    /* structured data */
    let graph = [];
    for (const raw of d.jsonld) { try { const j = JSON.parse(raw); graph = graph.concat(j["@graph"] || [j]); if (j["@context"] !== "https://schema.org") err("jsonld-context", p.path, ""); } catch (e) { err("jsonld-invalid", p.path, e.message); } }
    const wp = graph.find((g) => g["@type"] === "WebPage"), bc = graph.find((g) => g["@type"] === "BreadcrumbList"), faq = graph.find((g) => g["@type"] === "FAQPage");
    if (!wp) err("jsonld-webpage", p.path, "WebPage missing");
    else if (wp.url !== p.url || wp.name !== p.title || wp.description !== p.description || wp.inLanguage !== "ko" || !wp.isPartOf) err("jsonld-webpage", p.path, "WebPage does not match the page");
    if (!bc) err("jsonld-breadcrumb", p.path, "BreadcrumbList missing");
    else {
      const items = bc.itemListElement || [];
      if (items.length !== d.crumbs.length || items.some((it, i) => it.position !== i + 1 || it.name !== d.crumbs[i].name || !String(it.item).startsWith(SITE + "/livon/"))) err("jsonld-breadcrumb", p.path, "BreadcrumbList differs from the visible breadcrumb");
      if (JSON.stringify(items.map((x) => x.name)) !== JSON.stringify(p.breadcrumbs.map((b) => b.name))) err("breadcrumb-manifest", p.path, "");
    }
    if (faq) {
      if (p.type !== "help-home") err("jsonld-faq", p.path, "FAQPage only where the questions and answers are visible");
      for (const q of faq.mainEntity || []) if (!d.text.includes(q.name) || !d.text.includes(q.acceptedAnswer.text)) err("jsonld-faq", p.path, "FAQ text is not visible on the page: " + q.name);
    }
    for (const g of graph) if (["Organization", "Product", "Review", "AggregateRating", "Person"].includes(g["@type"])) err("jsonld-type", p.path, "unexpected " + g["@type"]);
    /* links */
    for (const href of d.links) {
      if (/^https:\/\//.test(href)) { externalLinks++; continue; }
      if (/^(http:|\/\/|javascript:|data:)/i.test(href)) { err("bad-link", p.path, href); continue; }
      if (href.charAt(0) === "#") continue;
      if (href.charAt(0) !== "/") { err("relative-link", p.path, href); continue; }
      const clean = href.split("#")[0].split("?")[0];
      const target = clean.endsWith("/") ? path.join(root, ...clean.split("/").filter(Boolean), "index.html") : path.join(root, ...clean.split("/").filter(Boolean));
      if (!fs.existsSync(target)) { brokenInternal++; err("broken-link", p.path, href); continue; }
      if (byPath[clean] && clean !== p.path) inbound.set(clean, (inbound.get(clean) || new Set()).add(p.path));
    }
    /* thin content: own text, useful links and a way into the app — not a word count alone */
    const T = POLICY.thin, internal = new Set(d.mainLinks.filter((h) => h.charAt(0) === "/" && h.split("#")[0] !== p.path)).size;
    const hasList = /<(ul|ol|dl)[\s>]/.test(d.mainHtml), hasCta = /class="lv-seo-btn" href="\/livon\/(#[^"]*)?"/.test(d.mainHtml);
    const isThin = d.text.length < T.minTextChars || internal < T.minInternalLinks || !hasList || !hasCta;
    if (isThin) { thin++; if (p.index) err("thin-indexable", p.path, `text ${d.text.length}, internal links ${internal}, list ${hasList}, cta ${hasCta}`); }
    if (!d.text.includes(p.h1)) err("h1-not-in-main", p.path, "");
  }
  /* orphans: every indexable page is linked from another indexable static page */
  let orphans = 0;
  for (const p of pages.filter((x) => x.index)) {
    const from = [...(inbound.get(p.path) || [])].filter((src) => byPath[src].index);
    if (!from.length) { orphans++; err("orphan", p.path, "no other indexable static page links here"); }
  }
  /* sitemap ⇄ manifest ⇄ files */
  const smPath = path.join(root, "sitemap.xml"), sm = fs.existsSync(smPath) ? fs.readFileSync(smPath, "utf8") : "";
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => unesc(m[1]));
  const livonLocs = locs.filter((l) => l.startsWith(SITE + "/livon/"));
  for (const p of pages) {
    if (p.index && !locs.includes(p.url)) err("sitemap-missing", p.path, "indexable page is not in sitemap.xml");
    if (!p.index && locs.includes(p.url)) err("sitemap-noindex", p.path, "noindex page is in sitemap.xml");
  }
  for (const l of livonLocs) {
    const rel = l.slice(SITE.length);
    if (rel !== "/livon/" && !byPath[rel]) err("sitemap-unknown", rel, "sitemap URL is not in the manifest");
    if (/[#?]/.test(l)) err("sitemap-hash-or-query", rel, "");
    if (/\/(admin|today|community|my-life|ai|search|onboarding)\//.test(rel)) err("sitemap-excluded-area", rel, "");
    if (!fs.existsSync(fileOf(root, rel))) err("sitemap-no-file", rel, "");
  }
  if (new Set(locs).size !== locs.length) err("sitemap-duplicate", "sitemap.xml", "");
  for (const m of sm.matchAll(/<loc>(https:\/\/www\.newon\.app\/livon\/[^<]*)<\/loc>\s*(<lastmod>([^<]*)<\/lastmod>)?/g)) {
    const pg = byPath[m[1].slice(SITE.length)];
    if (m[3] && (!pg || pg.lastmod !== m[3])) err("sitemap-lastmod", m[1], "lastmod without a source date");
  }
  /* excluded areas must not exist as generated pages */
  if (fs.existsSync(path.join(root, "livon", "admin"))) err("admin-published", "/livon/admin/", "");
  for (const dir of ["community", "my-life", "onboarding", "search", "ai"]) if (fs.existsSync(path.join(root, "livon", dir, "index.html"))) err("excluded-area-page", "/livon/" + dir + "/", "");
  /* the app page */
  const appFile = path.join(root, "livon", "index.html");
  if (fs.existsSync(appFile)) {
    const a = parsePage(fs.readFileSync(appFile, "utf8"));
    if (a.canonical !== SITE + "/livon/") err("app-canonical", "/livon/", String(a.canonical));
    if (a.robots !== (manifest.indexing ? "index, follow" : "noindex, nofollow")) err("app-robots", "/livon/", String(a.robots));
    if (!a.title || !a.description) err("app-meta", "/livon/", "");
    if (titles.has(a.title)) err("duplicate-title", "/livon/", "same as " + titles.get(a.title));
  } else err("app-missing", "/livon/", "");
  /* intents */
  for (const [q, target] of INTENTS) if (target !== "/livon/" && !(byPath[target] && byPath[target].index === manifest.indexing)) err("intent-target", target, "no page for intent: " + q);
  const stats = { pages: pages.length, indexable: pages.filter((p) => p.index).length + (manifest.indexing ? 1 : 0), excluded: manifest.excluded.length, sitemapLivon: livonLocs.length,
    uniqueTitles: titles.size, uniqueDescriptions: descs.size, thin, orphans, brokenInternal, externalLinks, intents: INTENTS.length };
  return { errors, warnings, stats, manifest, parsed };
}

function main() {
  const i = process.argv.indexOf("--root");
  const root = path.resolve(ROOT, i > 0 ? process.argv[i + 1] : "_publish");
  const r = checkSite(root);
  for (const e of r.errors.slice(0, 60)) console.error(`livon-seo-quality: ${e.code} ${e.where} ${e.msg}`);
  console.log(`livon-seo-quality: ${r.errors.length} error(s), ${r.warnings.length} warning(s) · ${JSON.stringify(r.stats)} · external links: format checked only (not fetched)`);
  if (r.errors.length) process.exit(1);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
