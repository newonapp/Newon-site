#!/usr/bin/env node
/**
 * Markdown blog pipeline — parses content/blog/{lang}/*.md
 * Publishes only status: published posts.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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
} from "./hub-utils.mjs";
import { renderStudioHeader, renderStudioFooter } from "./site-chrome.mjs";

const SHELL = fs.readFileSync(path.join(ROOT, "templates/hub-shell.html"), "utf8");
const BLOG_ROOT = path.join(ROOT, "content/blog");
const POST_LANGS = ["ko", "en"];

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  m[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if (v.startsWith("[") && v.endsWith("]")) {
      v = v
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
    } else {
      v = v.replace(/^['"]|['"]$/g, "");
    }
    meta[k] = v;
  });
  return { meta, body: m[2] };
}

function mdToHtml(md) {
  let html = md.trim();
  html = html.replace(/^### (.+)$/gm, "<h3 id=\"$1\">$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2 id=\"$1\">$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^\* (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (block) => {
    if (!block.includes("<ul>")) return `<ul>${block}</ul>`;
    return block;
  });
  html = html
    .split(/\n{2,}/)
    .map((p) => {
      if (/^<(h[1-3]|ul|ol|blockquote)/.test(p.trim())) return p;
      return `<p>${p.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
  return html;
}

function readingTime(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function loadPosts(lang) {
  const dir = path.join(BLOG_ROOT, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      return {
        ...meta,
        slug: meta.slug || file.replace(/\.md$/, ""),
        body,
        file,
      };
    })
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function localeFlat(langDir) {
  const lang = LANGS.find((l) => l.dir === langDir) || LANGS[1];
  const en = loadJson("en.json");
  const loc = lang.dir === "en" ? en : fillMissing(loadJson(lang.file), en);
  return { flat: flatten(loc), flatEn: flatten(en), lang };
}

function renderPost(langDir, post) {
  const { flat, flatEn, lang } = localeFlat(langDir);
  const htmlBody = mdToHtml(post.body);
  const mins = readingTime(post.body);
  const title = escapeHtml(post.title || post.slug);
  const canonical = `${SITE_ORIGIN}/${langDir}/blog/${post.slug}/`;
  const main = `<article class="hub-inner hub-section blog-post">
    <header class="blog-post__head">
      <p class="hub-eyebrow">${escapeHtml(post.category || "Blog")}</p>
      <h1 class="hub-title">${title}</h1>
      <p class="hub-lead">${escapeHtml(post.description || "")}</p>
      <p class="blog-post__meta">${escapeHtml(post.date || "")} · ${mins} min read</p>
    </header>
    <div class="blog-post__body">${htmlBody}</div>
  </article>`;
  const header = renderStudioHeader(flat, flatEn, { activeNav: "about" });
  const footer = renderStudioFooter(flat, flatEn);
  const html = applyTemplate(SHELL, flat, flatEn, {
    HTML_LANG: lang.htmlLang,
    TITLE: `${title} — Newon Blog`,
    META_DESCRIPTION: escapeHtml(post.description || ""),
    CANONICAL: canonical,
    OG_LOCALE: OG_LOCALE[langDir] || "en_US",
    HREFLANG_BLOCK: hreflangBlock(`blog/${post.slug}`),
    SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
    CHROME_HEADER: header,
    MAIN_CONTENT: main,
    CHROME_FOOTER: footer,
    EXTRA_CSS: '<link rel="stylesheet" href="/blog/blog.css?v=20260825studio" />',
    EXTRA_SCRIPTS: "",
  });
  const out = path.join(ROOT, langDir, "blog", post.slug, "index.html");
  ensureDir(out);
  fs.writeFileSync(out, html);
}

function blogIndexBody(posts, flat, flatEn) {
  const t = (k, fb) => escapeHtml(pick(flat, flatEn, k) || fb);
  const cards = posts.length
    ? posts
        .map(
          (p) => `<a class="hub-card" href="./${p.slug}/">
        <span class="hub-card__title">${escapeHtml(p.title || p.slug)}</span>
        <span class="hub-card__body">${escapeHtml(p.description || "")}</span>
        <span class="hub-card__meta">${escapeHtml(p.date || "")}</span>
      </a>`
        )
        .join("\n")
    : `<p class="hub-lead">${t("studio.blogEmpty", "Coming soon.")}</p>`;
  return `<section class="hub-hero hub-inner">
    <h1 class="hub-title">${t("studio.blogHeroTitle", "Blog")}</h1>
    <p class="hub-lead">${t("studio.blogMetaDescription", "")}</p>
  </section>
  <section class="hub-inner hub-section"><div class="hub-grid hub-grid--2">${cards}</div></section>`;
}

export function getPublishedPosts(lang) {
  return loadPosts(lang).filter((p) => p.status === "published");
}

/** Overwrite blog hub index with published posts list (other langs keep studio renderer if no posts). */
export function renderBlogPages() {
  for (const langDir of POST_LANGS) {
    const published = getPublishedPosts(langDir);
    published.forEach((post) => renderPost(langDir, post));
    if (!published.length) continue;
    const { flat, flatEn, lang } = localeFlat(langDir);
    const header = renderStudioHeader(flat, flatEn, { activeNav: "about" });
    const footer = renderStudioFooter(flat, flatEn);
    const body = blogIndexBody(published, flat, flatEn);
    const html = applyTemplate(SHELL, flat, flatEn, {
      HTML_LANG: lang.htmlLang,
      TITLE: escapeHtml(pick(flat, flatEn, "studio.blogSeoTitle") || "Blog — Newon"),
      META_DESCRIPTION: escapeHtml(pick(flat, flatEn, "studio.blogMetaDescription") || ""),
      CANONICAL: `${SITE_ORIGIN}/${langDir}/blog/`,
      OG_LOCALE: OG_LOCALE[langDir] || "en_US",
      HREFLANG_BLOCK: hreflangBlock("blog"),
      SKIP_LABEL: pick(flat, flatEn, "common.skipToContent") || "Skip to content",
      CHROME_HEADER: header,
      MAIN_CONTENT: body,
      CHROME_FOOTER: footer,
      EXTRA_CSS: "",
      EXTRA_SCRIPTS: "",
    });
    ensureDir(path.join(ROOT, langDir, "blog", "index.html"));
    fs.writeFileSync(path.join(ROOT, langDir, "blog", "index.html"), html);
  }
  console.log("render-blog: pipeline OK (draft posts excluded)");
}

if (process.argv[1] && process.argv[1].endsWith("render-blog.mjs")) {
  renderBlogPages();
}
