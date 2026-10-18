#!/usr/bin/env node
/**
 * Moves committed pages onto the merged "Business & Partnerships" header and footer (2026-10-19).
 * Same safety rule as migrate-bsp-nav.mjs: a header is replaced ONLY when it is identical (or identical apart
 * from whitespace) to what the PREVIOUS generator + PREVIOUS locales produce for that page; otherwise it is
 * updated surgically — only the Business trigger / panel / mobile accordion are swapped for the generated
 * ones and the Partnerships trigger / panel / mobile accordion are removed. Everything else in the header
 * (other menus, ids, active states, CSS versions) stays byte-for-byte.
 * Footers: only the Partnerships link is removed and the Business link label is renamed.
 *
 * Use (repo root, after the new site-chrome.mjs / venture-studio-data.mjs / locales are in place):
 *   mkdir -p /tmp/prev && git archive <previous-ref> scripts locales | tar -x -C /tmp/prev
 *   node scripts/migrate-bizpart-nav.mjs --old /tmp/prev [--dry]
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry");
const oldIdx = process.argv.indexOf("--old");
if (oldIdx < 0 || !process.argv[oldIdx + 1]) {
  console.error("usage: node scripts/migrate-bizpart-nav.mjs --old <dir with previous scripts/ and locales/> [--dry]");
  process.exit(2);
}
const OLD_DIR = path.resolve(process.argv[oldIdx + 1]);
const OLD = await import(pathToFileURL(path.join(OLD_DIR, "scripts", "site-chrome.mjs")).href);
const NEW = await import(pathToFileURL(path.join(ROOT, "scripts", "site-chrome.mjs")).href);
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const VENTURE_PAGES = new Set(["babylog", "petlog", "myworld"]);

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") { out[prefix] = obj; return out; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`))); return out; }
  for (const [k, v] of Object.entries(obj)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  return out;
}
function fillMissing(target, source) {
  if (source == null || typeof source !== "object" || Array.isArray(source)) return target;
  const out = target && typeof target === "object" && !Array.isArray(target) ? target : {};
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === "object" && !Array.isArray(v)) out[k] = fillMissing(out[k], v);
    else if (out[k] === undefined || out[k] === null || out[k] === "") out[k] = v;
  }
  return out;
}
function flats(dir) {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, "locales", f), "utf8"));
  const en = read("en.json");
  const out = {};
  for (const l of LANGS) out[l] = { flat: flatten(fillMissing(read(`${l}.json`), read("en.json"))), flatEn: flatten(en), raw: read(`${l}.json`) };
  return out;
}
const OLDF = flats(OLD_DIR);
const NEWF = flats(ROOT);

const HEADER_RE = /<header class="gnav site-header gnav--five gnav--ventures" data-gnav>[\s\S]*?<\/header>/g;
const norm = (x) => x.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
const panel = (src, id) => src.match(new RegExp(`\\s*<div class="gnav-mega" data-gnav-mega="${id}" role="menu" hidden>[\\s\\S]*?<p class="gnav-mega__foot">[\\s\\S]*?</p></div>\\s*</div>\\s*</div>`));
const trigger = (src, id) => src.match(new RegExp(`\\s*<div class="gnav-dd(?: gnav-dd--active)?" data-gnav-dd data-gnav-menu="${id}">[\\s\\S]*?</button>\\s*</div>`));
const acc = (src, hub) => src.match(new RegExp(`\\s*<div class="gnav-mobile__acc" data-gnav-acc>\\s*<div class="gnav-mobile__acc-head">\\s*<a class="gnav-mobile__acc-link" href="[^"]*(?<![a-z-])${hub}">[\\s\\S]*?<div class="gnav-mobile__acc-panel" hidden>[\\s\\S]*?</div>\\s*</div>`));

/** Swap the Business blocks for the generated ones and drop the Partnerships blocks. */
function surgical(h, gen) {
  let out = h;
  for (const [find, id] of [[trigger, "business"], [panel, "business"]]) {
    const a = find(out, id), b = find(gen, id);
    if (!a || !b) return null;
    out = out.replace(a[0], b[0]);
  }
  const a = acc(out, "business/"), b = acc(gen, "business/");
  if (!a || !b) return null;
  out = out.replace(a[0], b[0]);
  for (const m of [trigger(out, "partnerships"), panel(out, "partnerships")]) {
    if (!m) return null;
    out = out.replace(m[0], "");
  }
  const pa = acc(out, "partnerships/");
  if (!pa) return null;
  out = out.replace(pa[0], "");
  return out;
}

/** Old → new top-level Business label per locale (footer link text). */
const LABEL = Object.fromEntries(
  LANGS.map((l) => [l, { old: String(OLDF[l].raw.nav.topBusiness ?? OLDF.en.raw.nav.topBusiness), now: String(NEWF[l].raw.nav.topBizPart) }])
);
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const FOOT_RE = /(<footer class="site-footer site-footer--brand[^"]*"[^>]*>[\s\S]*?<nav class="site-foot__nav"[^>]*>)([\s\S]*?)(<\/nav>)/;
function migrateFooter(html, lang) {
  return html.replace(FOOT_RE, (all, open, links, close) => {
    if (!/href="[^"]*(?<![a-z-])partnerships\/"/.test(links)) return all;
    let next = links.replace(/<a href="[^"]*(?<![a-z-])partnerships\/">[^<]*<\/a>/, "");
    next = next.replace(/(<a href="[^"]*(?<![a-z-])business\/">)([^<]*)(<\/a>)/, (m, a, label, c) => {
      const langs = [lang, ...LANGS.filter((x) => x !== lang)];
      for (const l of langs) if (label === escHtml(LABEL[l].old) || label === LABEL[l].old) return `${a}${escHtml(LABEL[l].now)}${c}`;
      return `${a}${escHtml(LABEL[lang].now)}${c}`;
    });
    return open + next + close;
  });
}

const files = execSync("git ls-files '*.html'", { encoding: "utf8" }).split("\n").filter(Boolean);
const stats = { headers: 0, replaced: 0, replacedWs: 0, surgical: 0, already: 0, footers: 0, pages: 0, unmatched: [] };

for (const f of files) {
  if (f.startsWith("_publish/") || f.startsWith("templates/")) continue;
  let html = fs.readFileSync(f, "utf8");
  const before = html;
  const segs = f.split("/");
  const fileLang = LANGS.includes(segs[0]) ? segs[0] : "";
  const pageLang = fileLang || ((html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || "ko").toLowerCase().replace("pt-br", "pt-br");
  const activeVenture = fileLang && segs[1] === "portfolio" && VENTURE_PAGES.has(segs[2]) && segs.length === 4 ? segs[2] : "";
  html = html.replace(HEADER_RE, (h) => {
    stats.headers++;
    if (!h.includes('data-gnav-menu="partnerships"')) { stats.already++; return h; }
    const idSuffix = (h.match(/id="gnav-mobile-([^"]+)"/) || [])[1];
    const brand = (h.match(/<a class="gnav__brand" href="([^"]*)"/) || [])[1];
    const activeOld = (h.match(/gnav-dd--active" data-gnav-dd data-gnav-menu="([^"]+)"/) || [])[1] || "";
    const activeNew = activeOld === "partnerships" ? "business" : activeOld;
    const langTries = fileLang ? [fileLang, ...LANGS.filter((l) => l !== fileLang)] : LANGS;
    for (const lang of langTries) {
      const combos = [];
      for (const langDir of [lang, ""]) {
        if (brand === `/${langDir}/` && langDir) combos.push({ base: "./", langDir }, { base: "", langDir });
        combos.push({ base: brand, langDir });
      }
      for (const c of combos) {
        for (const av of activeVenture ? [activeVenture, ""] : [""]) {
          const opts = { activeNav: activeOld, activeVenture: av, base: c.base, idSuffix, langDir: c.langDir };
          const old = OLD.renderGlobalHeader(OLDF[lang].flat, OLDF[lang].flatEn, opts);
          if (old === h || norm(old) === norm(h)) {
            if (old === h) stats.replaced++; else stats.replacedWs++;
            return NEW.renderGlobalHeader(NEWF[lang].flat, NEWF[lang].flatEn, { ...opts, activeNav: activeNew });
          }
        }
      }
    }
    const lang = fileLang || (LANGS.includes(pageLang) ? pageLang : "ko");
    const gen = NEW.renderGlobalHeader(NEWF[lang].flat, NEWF[lang].flatEn, {
      activeNav: activeNew, activeVenture, base: brand === `/${lang}/` ? "./" : brand, idSuffix, langDir: lang,
    });
    const sg = surgical(h, gen);
    if (sg) { stats.surgical++; return sg; }
    stats.unmatched.push(f);
    return h;
  });
  const lang = fileLang || (LANGS.includes(pageLang) ? pageLang : "ko");
  const footed = migrateFooter(html, lang);
  if (footed !== html) { stats.footers++; html = footed; }
  if (html !== before) {
    stats.pages++;
    if (!DRY) fs.writeFileSync(f, html);
  }
}
console.log(JSON.stringify({ ...stats, unmatched: stats.unmatched.length, sample: stats.unmatched.slice(0, 20) }, null, 1));
