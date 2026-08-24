# Newon Blog content

Markdown posts live under locale folders:

- `content/blog/ko/` — Korean posts
- `content/blog/en/` — English posts

## Frontmatter

```yaml
---
title: Post title
description: Short summary for SEO
slug: url-slug
date: 2026-08-25
updatedAt: 2026-08-25
category: Product
tags: [apps, studio]
author: Newon
featured: false
status: draft   # draft | published
cover: /logo.png
---
```

- **`draft`** posts are **not** included in production output or sitemap.
- Do not commit fake launch posts. Add real articles when ready to publish.

## Build

```bash
node scripts/render-blog.mjs
```

Posts render to `{lang}/blog/{slug}/index.html` and update the blog index when `status: published`.
