#!/usr/bin/env node
/**
 * Re-inject global header/footer on localized index.html using current site-chrome + locales.
 */
import fs from "fs";
import path from "path";
import { LANGS, ROOT } from "./hub-utils.mjs";
import { injectSiteChrome, replaceLegacyChrome } from "./inject-chrome.mjs";
import { resolveActiveNav } from "./site-chrome.mjs";

const LOCALES = path.join(ROOT, "locales");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(LOCALES, file), "utf8"));
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

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (name === "node_modules" || name.startsWith(".")) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (name === "index.html") files.push(p);
  }
  return files;
}

function chromeBase(filePath, langDir) {
  const langRoot = path.join(ROOT, langDir);
  const depth = path.dirname(filePath).split(path.sep).length - langRoot.split(path.sep).length;
  return depth <= 0 ? "" : "../".repeat(depth);
}

function pathnameFromFile(filePath, langDir) {
  const rel = path.relative(path.join(ROOT, langDir), path.dirname(filePath)).replace(/\\/g, "/");
  return rel ? `/${langDir}/${rel}/` : `/${langDir}/`;
}

const flatEn = flatten(loadJson("en.json"));

for (const { dir, file } of LANGS) {
  const flat = flatten(loadJson(file));
  const langRoot = path.join(ROOT, dir);
  if (!fs.existsSync(langRoot)) continue;
  let n = 0;
  for (const filePath of walk(langRoot)) {
    let html = fs.readFileSync(filePath, "utf8");
    const base = chromeBase(filePath, dir);
    const activeNav = resolveActiveNav(pathnameFromFile(filePath, dir));
    let next = null;
    if (html.includes("{{CHROME_HEADER}}")) {
      next = injectSiteChrome(html, flat, flatEn, { activeNav, base, idSuffix: "refresh", langDir: dir });
    } else if (
      html.includes("gnav-dd__trigger") ||
      html.includes("class=\"gnav site-header") ||
      html.includes("class=\"site-header gnav") ||
      html.includes("studio-footer--compact") ||
      html.includes('class="site-footer"')
    ) {
      next = replaceLegacyChrome(html, flat, flatEn, { activeNav, base, langDir: dir });
    }
    if (!next || next === html) continue;
    fs.writeFileSync(filePath, next);
    n += 1;
  }
  console.log(`refresh-global-chrome: ${dir} — ${n} pages`);
}

console.log("refresh-global-chrome: OK");
