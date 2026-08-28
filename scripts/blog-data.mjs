/**
 * Load published blog posts from content/blog/{ko,en}/*.md
 * Shared by render-blog.mjs and resources-data/registry.
 */
import fs from "fs";
import path from "path";
import { ROOT } from "./hub-utils.mjs";

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

function loadPostsForLang(lang) {
  const dir = path.join(BLOG_ROOT, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { meta, body } = parseFrontmatter(raw);
      const slug = meta.slug || file.replace(/\.md$/, "");
      return {
        id: `blog-${slug}`,
        slug,
        type: "blog",
        status: meta.status || "draft",
        title: meta.title || slug,
        titleKo: lang === "ko" ? meta.title || slug : meta.titleKo || meta.title || slug,
        titleEn: lang === "en" ? meta.title || slug : meta.titleEn || meta.title || slug,
        descKo: lang === "ko" ? meta.description || "" : meta.descKo || meta.description || "",
        descEn: lang === "en" ? meta.description || "" : meta.descEn || meta.description || "",
        description: meta.description || "",
        category: meta.category || "Product",
        tags: Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : [],
        date: meta.date || meta.publishedAt || null,
        updatedAt: meta.updatedAt || meta.date || null,
        featured: meta.featured === true || meta.featured === "true",
        locale: lang,
        body,
        file,
      };
    });
}

/** Merge ko/en posts by slug; published only. */
export function loadPublishedBlogRegistry() {
  const bySlug = new Map();
  for (const lang of POST_LANGS) {
    for (const post of loadPostsForLang(lang)) {
      if (post.status !== "published") continue;
      const existing = bySlug.get(post.slug);
      if (!existing) {
        bySlug.set(post.slug, { ...post, locale: "all" });
      } else {
        if (lang === "ko") {
          existing.titleKo = post.titleKo;
          existing.descKo = post.descKo;
        } else {
          existing.titleEn = post.titleEn;
          existing.descEn = post.descEn;
        }
        existing.tags = [...new Set([...(existing.tags || []), ...(post.tags || [])])];
        existing.featured = existing.featured || post.featured;
        const d = post.date || post.updatedAt;
        const ed = existing.date || existing.updatedAt;
        if (d && (!ed || d > ed)) {
          existing.date = d;
          existing.updatedAt = post.updatedAt || d;
        }
      }
    }
  }
  return [...bySlug.values()].sort((a, b) =>
    String(b.updatedAt || b.date || "").localeCompare(String(a.updatedAt || a.date || ""))
  );
}
