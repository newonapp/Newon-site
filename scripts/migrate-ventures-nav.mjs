#!/usr/bin/env node
/**
 * Moves committed pages onto the two-row global header (flagship-business row).
 *
 * A page's header is replaced ONLY when it is identical (or identical apart from whitespace) to what the
 * PREVIOUS generator produces for that page, so hand-edited pages are never overwritten. Pages whose menu
 * copy was edited after generation are handled surgically (their own blocks are kept, LIVON/ONGIL are moved
 * to the business row). livon/ (LIVON's own header) is never touched. Also bumps the gnav-mega.css version.
 *
 * Use (repo root, after the new site-chrome.mjs is in place):
 *   mkdir -p /tmp/prev && git archive <previous-ref> scripts | tar -x -C /tmp/prev
 *   node scripts/migrate-ventures-nav.mjs --old /tmp/prev/scripts/site-chrome.mjs [--dry]
 * Then rebuild in a COPY of the repo and confirm every header matches (see the PR description).
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { pathToFileURL } from "url";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry");
const oldIdx = process.argv.indexOf("--old");
if (oldIdx < 0 || !process.argv[oldIdx + 1]) {
  console.error("usage: node scripts/migrate-ventures-nav.mjs --old <previous scripts/site-chrome.mjs> [--dry]");
  process.exit(2);
}
const OLD = await import(pathToFileURL(path.resolve(process.argv[oldIdx + 1])).href);
const NEW = await import(pathToFileURL(path.join(ROOT, "scripts", "site-chrome.mjs")).href);
if (!NEW.VENTURE_NAV) {
  console.error("scripts/site-chrome.mjs is not the two-row generator yet");
  process.exit(2);
}
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const CSSV = "gnav-mega.css?v=20261017ventures1";
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
const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "locales", f), "utf8"));
const EN = read("en.json");
const FLATS = {};
for (const l of LANGS) FLATS[l] = { flat: flatten(fillMissing(read(`${l}.json`), read("en.json"))), flatEn: flatten(EN) };


// Surgical path for headers whose menu copy was edited after generation: keep every existing
// block as-is, move the LIVON / ONGIL blocks into the business row, add the four new links.
function surgical(h, f, gen) {
  const ddRe = (id) => new RegExp(`\\s*<div class="gnav-dd(?: gnav-dd--active)?" data-gnav-dd data-gnav-menu="${id}">[\\s\\S]*?</button>\\s*</div>`);
  const relabel = (block) => block.replace(/>LivOn</g, ">LIVON<").replace(/aria-label="LivOn"/g, 'aria-label="LIVON"').replace(/>Ongil</g, ">ONGIL<").replace(/aria-label="Ongil"/g, 'aria-label="ONGIL"');
  const scrollStart = h.indexOf('<div class="gnav__nav-scroller">');
  const scrollEnd = h.indexOf("</nav>", scrollStart);
  let row = h.slice(scrollStart, scrollEnd);
  const dds = {};
  for (const id of ["lifestage", "ongil"]) {
    const m = row.match(ddRe(id)); if (!m) return null;
    dds[id] = m[0].trim(); row = row.replace(m[0], "");
  }
  let out = h.slice(0, scrollStart) + row + h.slice(scrollEnd);
  // desktop business row: generated row, but LIVON/ONGIL blocks are this page's own (relabelled)
  const genRow = gen.match(/<nav class="gnav__ventures"[\s\S]*?<\/nav>/)[0];
  let myRow = genRow;
  for (const id of ["lifestage", "ongil"]) {
    const g = genRow.match(ddRe(id)); if (!g) return null;
    myRow = myRow.replace(g[0].trim(), relabel(dds[id]));
  }
  const mob = out.indexOf('<div id="gnav-mobile-');
  const barEnd = out.lastIndexOf("</div>", mob);
  out = out.slice(0, barEnd) + "  " + myRow + "\n      " + out.slice(barEnd);
  // mobile: move this page's LIVON/ONGIL accordions into a business group placed first
  const accRe = (path) => new RegExp(`\\s*<div class="gnav-mobile__acc" data-gnav-acc>\\s*<div class="gnav-mobile__acc-head">\\s*<a class="gnav-mobile__acc-link" href="[^"]*${path}">[\\s\\S]*?<div class="gnav-mobile__acc-panel" hidden>[\\s\\S]*?</div>\\s*</div>`);
  const accs = {};
  for (const [id, pth] of [["lifestage", "lifestage/"], ["ongil", "ongil/"]]) {
    const m = out.match(accRe(pth)); if (!m) return null;
    accs[id] = relabel(m[0].trim()); out = out.replace(m[0], "");
  }
  let genGroup = gen.match(/<div class="gnav-mobile__ventures"[\s\S]*?<\/div>\s*<div class="gnav-mobile__divider" aria-hidden="true"><\/div>/)[0];
  for (const [id, pth] of [["lifestage", "lifestage/"], ["ongil", "ongil/"]]) {
    const g = genGroup.match(accRe(pth)); if (!g) return null;
    genGroup = genGroup.replace(g[0].trim(), accs[id]);
  }
  const anchor = '<div class="gnav-mobile__divider" aria-hidden="true"></div>';
  const first = out.indexOf(anchor); if (first < 0) return null;
  out = out.slice(0, first + anchor.length) + "\n          " + genGroup + out.slice(first + anchor.length);
  return out.replace('<header class="gnav site-header gnav--five" data-gnav>', '<header class="gnav site-header gnav--five gnav--ventures" data-gnav>');
}

const HEADER_RE = /<header class="gnav site-header gnav--five" data-gnav>[\s\S]*?<\/header>/g;
const files = execSync("git ls-files '*.html'", { encoding: "utf8" }).split("\n").filter(Boolean);
const stats = { pages: 0, headers: 0, replaced: 0, replacedWs: 0, unmatched: [] };
const norm = (x) => x.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

for (const f of files) {
  let html = fs.readFileSync(f, "utf8");
  const before = html;
  const segs = f.split("/");
  const fileLang = LANGS.includes(segs[0]) ? segs[0] : "";
  const activeVenture =
    fileLang && segs[1] === "portfolio" && VENTURE_PAGES.has(segs[2]) && segs.length === 4 ? segs[2] : "";
  let any = false, replacedHere = false;
  html = html.replace(HEADER_RE, (h) => {
    any = true;
    stats.headers++;
    const idSuffix = (h.match(/id="gnav-mobile-([^"]+)"/) || [])[1];
    const brand = (h.match(/<a class="gnav__brand" href="([^"]*)"/) || [])[1];
    const activeNav = (h.match(/gnav-dd--active" data-gnav-dd data-gnav-menu="([^"]+)"/) || [])[1] || "";
    const langTries = fileLang ? [fileLang, ...LANGS.filter((l) => l !== fileLang)] : LANGS;
    for (const lang of langTries) {
      const { flat, flatEn } = FLATS[lang];
      const combos = [];
      for (const langDir of [lang, ""]) {
        if (brand === `/${langDir}/` && langDir) combos.push({ base: "./", langDir }, { base: "", langDir });
        combos.push({ base: brand, langDir });
      }
      for (const c of combos) {
        const opts = { activeNav, base: c.base, idSuffix, langDir: c.langDir };
        const old = OLD.renderGlobalHeader(flat, flatEn, opts);
        if (old === h || norm(old) === norm(h)) {
          if (old === h) stats.replaced++; else stats.replacedWs++;
          replacedHere = true;
          return NEW.renderGlobalHeader(flat, flatEn, { ...opts, activeVenture });
        }
      }
    }
    if (f.startsWith("livon/")) { stats.unmatched.push(f); return h; }
    const lang = fileLang || "ko";
    const { flat, flatEn } = FLATS[lang];
    const gen = NEW.renderGlobalHeader(flat, flatEn, { activeNav, base: brand === `/${lang}/` ? "./" : brand, idSuffix, langDir: lang, activeVenture });
    const sg = surgical(h, f, gen);
    if (sg) { stats.surgical = (stats.surgical || 0) + 1; replacedHere = true; return sg; }
    stats.unmatched.push(f);
    return h;
  });
  if (!any || !replacedHere) continue;
  stats.pages++;
  html = html.replace(/gnav-mega\.css(\?v=[A-Za-z0-9]+)?(?=["'])/g, CSSV);
  if (html !== before && !DRY) fs.writeFileSync(f, html);
}
console.log(JSON.stringify({ ...stats, unmatched: stats.unmatched.length, sample: stats.unmatched }, null, 1));
