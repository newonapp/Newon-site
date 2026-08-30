#!/usr/bin/env node
/**
 * One-shot: localized HTML build + assemble _publish/ for GitHub Pages (or local preview).
 *
 *   node scripts/publish-site.mjs
 *
 * 배포 단위는 오직 _publish/ 한 폴더입니다. (Git에는 소스만 커밋; Pages에는 Actions가 _publish 업로드)
 * HTML이 참조하는 이미지·CSS·JS·로케일·i18n 이미지는 모두 이 스크립트가 같은 트리로 복사합니다.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { publishedArticles } from "./news-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "_publish");

const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

/** 사이트 루트 URL (/파일명) 그대로 쓰는 HTML·CSS·JS — HTML과 같은 층에 둠 */
const PUBLISH_ROOT_CORE = [
  "index.html",
  "lang-nav.js",
  "lang-dropdown.js",
  "theme-shell.js",
  "hero-apps.js",
  "analytics.js",
  "search.js",
  "waitlist.js",
  "site-chrome.js",
  "search-index.json",
  "styles.css",
  "gnav-mega.css",
  "site-dark.css",
  "site-mobile.css",
  "site-premium.css",
  "hub-pages.css",
  "home-studio.css",
  "home-studio.js",
  "apps-hub.css",
  "apps-hub.js",
  "ai-hub.css",
  "ai-hub.js",
  "saas-hub.css",
  "saas-hub.js",
  "games-hub.css",
  "games-hub.js",
  "tools-hub.css",
  "business-service.css",
  "business-service.js",
  "business-type.css",
  "data-reporting.css",
  "business-pillar.css",
  "business-pillar.js",
  "pillar-service.css",
  "pillar-service.js",
  "business-page.css",
  "business-creative.css",
  "business-creative.js",
  "newon-studio.css",
  "about-page.css",
  "hover-contrast.css",
  "about-page.js",
  "company.css",
  "company.js",
  "resources.css",
  "resources.js",
  "blog-hub.css",
  "store-detail.css",
  "media-hub.css",
  "media-hub.js",
  "labs-detail.css",
  "labs-detail.js",
  "product-hubs.css",
  "ox-month.css",
  "app-landing-extras.css",
  "robots.txt",
  "sitemap.xml",
];

/**
 * 사이트 루트에 두는 래스터 에셋 (템플릿에서 /logo.png 처럼 참조).
 * i18n-img·ox-img·subping-img 아래 파일은 각 디렉터리 복사로 함께 따라감.
 */
const PUBLISH_ROOT_IMAGES = [
  "logo.png",
  "logo-n.png",
  "favicon.ico",
  "apple-touch-icon.png",
  "ox-month-logo.png",
  "subping-logo.png",
  "pillmate-logo.png",
  "savy-logo.png",
  "babylog-logo.png",
  "petlog-logo.png",
  "piggyup-logo.png",
  "goalup-logo.png",
  "countup-logo.png",
  "newon-plus-logo.png",
  "newon-wordmark-chrome.png",
  "newon-wordmark-chrome-dark.png",
  "myworld-logo.png",
  "404-human-logo.png",
  "subping-hero-mark.png",
  "feature-grid.png",
  "hero-promo.png",
  "step-add-habit.png",
  "step-daily-check.png",
  "step-stats.png",
];

/** 통째로 _publish/<이름>/ 에 복사 (HTML과 상대 경로로 묶임) */
const PUBLISH_COPY_DIRS = [
  { from: "locales", to: "locales", required: true },
  { from: "i18n-img", to: "i18n-img", required: false },
  { from: "ox-img", to: "ox-img", required: false },
  { from: "subping-img", to: "subping-img", required: false },
  { from: "myworld-img", to: "myworld-img", required: false },
  { from: "privacy", to: "privacy", required: false },
  { from: "terms", to: "terms", required: true },
  { from: "about", to: "about", required: true },
  { from: "news", to: "news", required: true },
  { from: "ideas", to: "ideas", required: true },
  { from: "business", to: "business", required: true },
  { from: "404-human", to: "404-human", required: true },
  { from: "card-n7x4k9", to: "card-n7x4k9", required: true },
  { from: "portfolio", to: "portfolio", required: true },
  { from: "tools", to: "tools", required: true },
  { from: "products", to: "products", required: false },
  { from: "ai", to: "ai", required: false },
  { from: "saas", to: "saas", required: false },
  { from: "games", to: "games", required: false },
  { from: "studio", to: "studio", required: false },
  { from: "store", to: "store", required: false },
  { from: "media", to: "media", required: false },
  { from: "media-thumbs", to: "media-thumbs", required: false },
  { from: "blog-thumbs", to: "blog-thumbs", required: false },
  { from: "blog", to: "blog", required: false },
  { from: "labs", to: "labs", required: false },
  { from: "market", to: "market", required: false },
  { from: "contact", to: "contact", required: false },
  { from: "admin", to: "admin", required: false },
  { from: "oxmonth", to: "oxmonth", required: false },
  { from: "subping", to: "subping", required: false },
];

const PUBLISH_ROOT_OPTIONAL = [
  "CNAME",
  ".nojekyll",
  "naver0a5bd04cafdfbdba9b8fa4d3c8daa648.html",
];

/** Legal redirects + AdMob (must be at site root for App Store / Google). */
const PUBLISH_ROOT_LEGAL = ["terms.html", "privacy.html", "app-ads.txt"];

const ALL_PUBLISH_ROOT_FILES = [...PUBLISH_ROOT_CORE, ...PUBLISH_ROOT_IMAGES];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

/** Re-sync Flutter Web output into the final Pages artifact (runs last). */
function stageHuman404Play() {
  const src = path.join(ROOT, "404-human", "play");
  const dest = path.join(OUT, "404-human", "play");
  if (!fs.existsSync(src)) {
    console.error("publish-site: missing source 404-human/play/");
    process.exit(1);
  }
  fs.rmSync(dest, { recursive: true, force: true });
  copyDir(src, dest);
  const marker = [
    new Date().toISOString(),
    process.env.GITHUB_SHA || "local",
    process.env.GITHUB_RUN_ID || "",
  ].join("\n");
  fs.writeFileSync(path.join(dest, "deploy-marker.txt"), `${marker}\n`, "utf8");
  console.log("publish-site: staged 404-human/play → _publish/404-human/play");
}

function copyFileIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.copyFileSync(src, dest);
  return true;
}

function runBuild() {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "build-i18n.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function runPortfolio() {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", "gen-portfolio.mjs")], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function validateHuman404Game() {
  const r = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "validate-404-human-play.mjs")],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function assemble() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const name of PUBLISH_ROOT_CORE) {
    const src = path.join(ROOT, name);
    if (!fs.existsSync(src)) {
      console.error(`publish-site: missing root core file ${name}`);
      process.exit(1);
    }
    fs.copyFileSync(src, path.join(OUT, name));
  }

  for (const name of PUBLISH_ROOT_IMAGES) {
    const src = path.join(ROOT, name);
    if (!copyFileIfExists(src, path.join(OUT, name))) {
      console.error(`publish-site: missing root image ${name}`);
      process.exit(1);
    }
  }

  for (const lang of LANGS) {
    const src = path.join(ROOT, lang);
    if (!fs.statSync(src).isDirectory()) {
      console.error(`publish-site: missing language dir ${lang}/`);
      process.exit(1);
    }
    copyDir(src, path.join(OUT, lang));
  }

  for (const { from, to, required } of PUBLISH_COPY_DIRS) {
    const src = path.join(ROOT, from);
    const dest = path.join(OUT, to);
    if (!fs.existsSync(src)) {
      if (required) {
        console.error(`publish-site: missing required dir ${from}/`);
        process.exit(1);
      }
      continue;
    }
    copyDir(src, dest);
  }

  for (const name of PUBLISH_ROOT_OPTIONAL) {
    copyFileIfExists(path.join(ROOT, name), path.join(OUT, name));
  }

  for (const name of PUBLISH_ROOT_LEGAL) {
    if (!copyFileIfExists(path.join(ROOT, name), path.join(OUT, name))) {
      console.warn(`publish-site: optional legal root file missing ${name}`);
    }
  }

  stageHuman404Play();
}

function verify() {
  const required = [
    ...ALL_PUBLISH_ROOT_FILES.map((f) => path.join(OUT, f)),
    path.join(OUT, "ox-img", "ox-month-panels.png"),
    path.join(OUT, "locales", "en.json"),
  ];
  for (const lang of LANGS) {
    required.push(
      path.join(OUT, lang, "index.html"),
      path.join(OUT, lang, "privacy", "index.html"),
      path.join(OUT, lang, "terms", "index.html"),
      path.join(OUT, lang, "about", "index.html"),
      path.join(OUT, lang, "news", "index.html"),
      path.join(OUT, lang, "ideas", "index.html"),
      path.join(OUT, lang, "ideas", "success", "index.html"),
      path.join(OUT, lang, "business", "index.html"),
      path.join(OUT, lang, "business", "partnership", "index.html"),
      path.join(OUT, lang, "business", "service", "index.html"),
      path.join(OUT, lang, "business", "promotion", "index.html"),
      path.join(OUT, lang, "business", "development", "index.html"),
      path.join(OUT, lang, "business", "inquiry", "success", "index.html"),
      path.join(OUT, lang, "404-human", "index.html"),
      path.join(OUT, lang, "products", "index.html"),
      path.join(OUT, lang, "apps", "index.html"),
      path.join(OUT, lang, "tools", "index.html"),
      path.join(OUT, lang, "tools", "qr", "index.html"),
      path.join(OUT, lang, "ai", "index.html"),
      path.join(OUT, lang, "games", "index.html"),
      path.join(OUT, lang, "contact", "index.html"),
      path.join(OUT, lang, "oxmonth", "delete-account", "index.html"),
      path.join(OUT, lang, "subping", "delete-account", "index.html")
    );
  }
  for (const article of publishedArticles()) {
    required.push(path.join(OUT, "news", article.slug, "index.html"));
    for (const lang of LANGS) {
      required.push(path.join(OUT, lang, "news", article.slug, "index.html"));
    }
  }
  required.push(path.join(OUT, "privacy", "index.html"));
  required.push(path.join(OUT, "terms", "index.html"));
  required.push(path.join(OUT, "about", "index.html"));
  required.push(path.join(OUT, "news", "index.html"));
  required.push(path.join(OUT, "news", "news.css"));
  required.push(path.join(OUT, "news", "news.js"));
  required.push(path.join(OUT, "ideas", "index.html"));
  required.push(path.join(OUT, "ideas", "ideas.css"));
  required.push(path.join(OUT, "ideas", "ideas.js"));
  required.push(path.join(OUT, "business", "inquiry.js"));
  required.push(path.join(OUT, "business", "inquiry", "success", "index.html"));
  required.push(path.join(OUT, "business", "partnership", "index.html"));
  required.push(path.join(OUT, "business", "service", "index.html"));
  required.push(path.join(OUT, "business", "promotion", "index.html"));
  required.push(path.join(OUT, "business", "development", "index.html"));
  required.push(path.join(OUT, "404-human", "index.html"));
  required.push(path.join(OUT, "404-human", "404-human.css"));
  required.push(path.join(OUT, "404-human", "404-human.js"));
  required.push(path.join(OUT, "404-human", "play-config.js"));
  required.push(path.join(OUT, "404-human", "play", "index.html"));
  required.push(path.join(OUT, "404-human", "play", "flutter.js"));
  required.push(path.join(OUT, "404-human", "play", "flutter_bootstrap.js"));
  required.push(path.join(OUT, "404-human", "play", "flutter_service_worker.js"));
  required.push(path.join(OUT, "404-human", "play", "main.dart.js"));
  required.push(path.join(OUT, "404-human", "play", "manifest.json"));
  required.push(path.join(OUT, "404-human", "play", "assets", "AssetManifest.bin.json"));
  required.push(path.join(OUT, "404-human", "play", "canvaskit", "canvaskit.wasm"));
  for (const lang of LANGS) {
    required.push(path.join(OUT, lang, "404-human", "play", "index.html"));
  }
  required.push(path.join(OUT, "card-n7x4k9", "index.html"));
  required.push(path.join(OUT, "card-n7x4k9", "card-config.js"));
  required.push(path.join(OUT, "card-n7x4k9", "nawon-kyung.vcf"));
  required.push(path.join(OUT, "portfolio", "index.html"));
  required.push(path.join(OUT, "portfolio", "portfolio.css"));
  required.push(path.join(OUT, "portfolio", "portfolio.js"));
  required.push(path.join(OUT, "portfolio", "babylog", "index.html"));
  required.push(path.join(OUT, "ko", "portfolio", "index.html"));
  required.push(path.join(OUT, "en", "portfolio", "index.html"));
  required.push(path.join(OUT, "ja", "portfolio", "index.html"));
  required.push(path.join(OUT, "search-index.json"));
  required.push(path.join(OUT, "hub-pages.css"));
  required.push(path.join(OUT, "analytics.js"));
  required.push(path.join(OUT, "sitemap.xml"));
  const sitemap = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
  if (sitemap.includes("card-n7x4k9")) {
    console.error("publish-site verify: card QR page must not appear in sitemap.xml");
    process.exit(1);
  }
  if (!sitemap.includes("/portfolio/")) {
    console.error("publish-site verify: sitemap.xml must include /portfolio/");
    process.exit(1);
  }
  const robots = fs.readFileSync(path.join(OUT, "robots.txt"), "utf8");
  if (!robots.includes("Disallow: /card-n7x4k9")) {
    console.error("publish-site verify: robots.txt must disallow the card QR page");
    process.exit(1);
  }
  for (const name of ["terms.html", "privacy.html"]) {
    required.push(path.join(OUT, name));
  }
  required.push(path.join(OUT, "oxmonth", "delete-account", "index.html"));
  required.push(path.join(OUT, "subping", "delete-account", "index.html"));
  for (const f of required) {
    if (!fs.existsSync(f)) {
      console.error(`publish-site verify: missing ${path.relative(ROOT, f)}`);
      process.exit(1);
    }
  }
  console.log("publish-site verify: OK");
}

function verifyArtifact() {
  const r = spawnSync(
    process.execPath,
    [path.join(ROOT, "scripts", "validate-404-human-artifact.mjs")],
    {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, PAGES_ARTIFACT_DIR: OUT },
    },
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

runBuild();
runPortfolio();
validateHuman404Game();
assemble();

verify();
verifyArtifact();

console.log("publish-site OK →", path.relative(process.cwd(), OUT));
