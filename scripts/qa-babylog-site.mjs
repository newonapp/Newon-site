#!/usr/bin/env node
/**
 * qa-babylog-site — static verification of the BABYLOG corporate website (5 pages × 9 locales).
 *
 *   node scripts/qa-babylog-site.mjs [--root <dir>] [--against <git-ref>] [--json <file>]
 *
 * Checks (each prints PASS / FAIL; exit 1 on any FAIL):
 *   menu        5 menu links on every page, exact hrefs, one aria-current on the right item
 *   sections    every section of the content master plan is present (counts + ids), and each menu page shows
 *               ONLY its own content (no platform rows / business rows / partner tiles / contact rows elsewhere)
 *   seo         unique title/description per page, canonical, 9 hreflang + x-default, og:*, JSON-LD parses
 *   a11y        one h1, no heading level skips, labelled nav/landmarks, no empty links/buttons
 *   info-only   no form/input/select/textarea/password/payment controls
 *   revenue     no price, fee rate or internal revenue figure in the public pages
 *   status      released/direction/review labels present; fallback locales carry lang="en"
 *   links       internal links resolve to files; #anchors exist on the target page; inquiry links carry the source
 *   stores      only the two verified BabyLog store URLs; delete-account page still present
 *   scope       (with --against) other platform pages and the Life Stage originals are byte-identical to the ref
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import { BL_NAV, PARTNER_CODES, CONTACT_CODES, PLATFORM_GROUP_CODES } from "./babylog-site-copy.mjs";
import { BUSINESS } from "./six-businesses.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const ROOT = path.resolve(arg("--root") || path.join(HERE, ".."));
const AGAINST = arg("--against");
const JSON_OUT = arg("--json");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const HREFLANG = { ko: "ko", en: "en", ja: "ja", es: "es", "pt-br": "pt-BR", fr: "fr", de: "de", hi: "hi", id: "id" };

const results = [];
function rec(check, ok, detail) {
  results.push({ check, ok, detail });
  if (!ok) console.log(`FAIL ${check}: ${detail}`);
}
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const pageFile = (lang, sub) => `${lang}/babylog/${sub ? sub + "/" : ""}index.html`;
const mainOf = (html) => {
  const i = html.indexOf('id="lifestage-detail"');
  const j = html.indexOf("</main>", i);
  return html.slice(i, j > 0 ? j : undefined);
};
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
const text = (h) => strip(h).replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ");
const count = (h, re) => (h.match(re) || []).length;

const pages = [];
for (const lang of LANGS) for (const nav of BL_NAV) pages.push({ lang, nav, file: pageFile(lang, nav.sub) });

/* ---- existence ---- */
const missing = pages.filter((p) => !exists(p.file)).map((p) => p.file);
rec("pages-exist", missing.length === 0, `${pages.length - missing.length}/${pages.length}${missing.length ? " missing: " + missing.slice(0, 5).join(", ") : ""}`);
if (missing.length) finish();

const html = new Map(pages.map((p) => [p.file, read(p.file)]));
const titles = new Map();
const descs = new Map();

for (const p of pages) {
  const h = html.get(p.file);
  const body = mainOf(h);
  const tag = `${p.lang}/${p.nav.id}`;

  /* ---- menu ---- */
  const nav = (h.match(/<nav class="fsn" data-biz="babylog"[\s\S]*?<\/nav>/) || [""])[0];
  const links = [...nav.matchAll(/<a class="fsn__a" href="([^"]+)"( aria-current="page")?/g)];
  const want = BL_NAV.map((n) => `/${p.lang}/babylog/${n.sub ? n.sub + "/" : ""}`);
  const gotHrefs = links.map((m) => m[1]);
  const cur = links.filter((m) => m[2]).map((m) => m[1]);
  rec(
    `menu ${tag}`,
    JSON.stringify(gotHrefs) === JSON.stringify(want) && cur.length === 1 && cur[0] === want[BL_NAV.indexOf(p.nav)],
    `links ${links.length}, current ${cur.join(",")}`
  );

  /* ---- sections ---- */
  const ids = new Set([...body.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  let secOk = true;
  let secInfo = "";
  const sect = (id) => {
    const i = body.indexOf(`id="${id}"`);
    if (i < 0) return "";
    const j = body.indexOf("</section>", i);
    return body.slice(i, j > 0 ? j : undefined);
  };
  const pad = (i) => String(i).padStart(2, "0");
  const lackOf = (list) => list.filter((i) => !ids.has(i));
  // Content that belongs to one menu page only (ONGIL-style: each sub-menu shows only its own content).
  const foreign = {
    platform: count(body, /class="bl-row"/g),
    business: count(body, /class="bl-brow"/g),
    partnerships: count(body, /class="bl-tile"/g),
    contact: count(body, /class="bl-crow"/g),
  };
  const leak = Object.entries(foreign).filter(([k, v]) => k !== p.nav.id && v > 0).map(([k, v]) => `${k}:${v}`);
  const brand = /class="bl-brand"/.test(body);
  const more = count(body, /class="bl-more__a"/g);
  if (p.nav.id === "overview") {
    const lack = lackOf(["bl-about", "bl-mission", "bl-journey", "bl-core", "bl-family", "bl-beyond", "bl-commit", "bl-close"]);
    const tl = count(sect("bl-journey"), /class="bl-tl__item"/g);
    const core = count(sect("bl-core"), /class="bl-matrix__cell"/g);
    const coreSt = count(sect("bl-core"), /<div class="bl-matrix__top">[\s\S]*?bl-status--/g);
    const mission = count(sect("bl-mission"), /class="bl-mission__n"/g);
    const commit = count(sect("bl-commit"), /<li><svg class="bl-check"/g);
    const roles = count(sect("bl-family"), /class="bl-orbit__role /g);
    const chain = count(sect("bl-beyond"), /class="bl-chain__t"/g);
    const ctas = count(sect("bl-close"), /class="nls-btn/g);
    secOk = !lack.length && tl === 7 && core === 6 && coreSt === 6 && mission === 5 && commit === 6 && roles === 3 && chain === 5 && ctas === 3;
    secInfo = `missing ${lack.join(",") || "-"}, journey ${tl}/7, core ${core}/6 (status ${coreSt}), mission ${mission}/5, commitment ${commit}/6, family roles ${roles}, chain ${chain}/5, next-step CTAs ${ctas}/3`;
  } else if (p.nav.id === "platform") {
    const lack = lackOf([...PLATFORM_GROUP_CODES.map((c) => "bl-grp-" + c), ...Array.from({ length: 21 }, (_, i) => "bl-svc-" + pad(i + 1)), "bl-groups", "bl-access", "bl-close"]);
    const rows = count(body, /class="bl-row"/g);
    const st = count(body, /<div class="bl-row__st"><span class="bl-status bl-status--(live|prep|plan)"/g);
    const idx = count(body, /class="bl-gidx__a"/g);
    const med = /id="bl-svc-07"[\s\S]*?bl-row__note--medical[\s\S]*?id="bl-svc-08"/.test(body);
    const sh = /id="bl-svc-16"[\s\S]*?bl-row__note--shareon[\s\S]*?id="bl-svc-17"/.test(body);
    secOk = !lack.length && rows === 21 && st === 21 && idx === 5 && med && sh;
    secInfo = `missing ${lack.join(",") || "-"}, service rows ${rows}/21 (status ${st}), group index ${idx}/5, medical note on 07 ${med}, SHAREON note on 16 ${sh}`;
  } else if (p.nav.id === "business") {
    const lack = lackOf([...Array.from({ length: 8 }, (_, i) => "grp-" + pad(i + 1)), ...Array.from({ length: 32 }, (_, i) => "biz-" + pad(i + 1)), "bl-bintro", "bl-groups", "bl-models", "bl-revenue", "bl-close"]);
    const rows = count(body, /class="bl-brow"/g);
    const st = count(body, /<div class="bl-brow__st"><span class="bl-status bl-status--(live|prep|plan)"/g);
    const rail = count(body, /class="bl-rail__a"/g);
    const models = count(sect("bl-models"), /<tr><th scope="row"/g);
    const rule = /class="bl-rule"/.test(sect("bl-revenue"));
    secOk = !lack.length && rows === 32 && st === 32 && rail === 8 && models === 5 && rule;
    secInfo = `missing ${lack.join(",") || "-"}, business rows ${rows}/32 (status ${st}), group jump links ${rail}/8, models ${models}/5, never-monetized rule ${rule}`;
  } else if (p.nav.id === "partnerships") {
    const lack = lackOf([...PARTNER_CODES.map((c) => "partner-" + c), "bl-cats", "bl-why", "bl-principles", "bl-process", "bl-close"]);
    const tiles = count(body, /class="bl-tile"/g);
    const tileLinks = [...body.matchAll(/class="bl-tile__a" href="([^"]+)"/g)].map((m) => (m[1].match(/source=babylog-partnerships-([a-z-]+)/) || [])[1]);
    const princ = count(sect("bl-principles"), /class="bl-princ__n"/g);
    const steps = count(sect("bl-process"), /class="bl-steps__n"/g);
    const pts = count(sect("bl-why"), /<li><span>0[1-5]<\/span>/g);
    const review = /bl-status--review/.test(sect("bl-cats"));
    secOk = !lack.length && tiles === 15 && JSON.stringify(tileLinks) === JSON.stringify(PARTNER_CODES) && princ === 6 && steps === 5 && pts === 5 && review;
    secInfo = `missing ${lack.join(",") || "-"}, categories ${tiles}/15, category inquiry codes ${tileLinks.filter(Boolean).length}/15, principles ${princ}/6, steps ${steps}/5, why points ${pts}/5, review label ${review}`;
  } else {
    const rowsH = [...body.matchAll(/class="bl-crow" href="([^"]+)"/g)].map((m) => m[1]);
    const codes = rowsH.map((c) => (c.match(/source=babylog-contact-([a-z-]+)/) || [])[1]);
    const card = /class="bl-ccard"/.test(body) && /href="mailto:newon@newon.app"/.test(body);
    const lack = lackOf(["bl-cats", "bl-guide", "bl-close"]);
    secOk = !lack.length && rowsH.length === 17 && JSON.stringify(codes) === JSON.stringify(CONTACT_CODES) && card && /bl-emergency/.test(sect("bl-guide"));
    secInfo = `missing ${lack.join(",") || "-"}, categories ${rowsH.length}/17, codes ${codes.join(",")}, NEWON contact card ${card}`;
  }
  secOk = secOk && leak.length === 0 && brand && more === 4;
  secInfo += `, other pages' content ${leak.join(",") || "none"}, brand sign-off ${brand}, menu strip ${more}/4`;
  rec(`sections ${tag}`, secOk, secInfo);

  /* ---- seo ---- */
  const title = (h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "";
  const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || "";
  const canon = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || "";
  const wantCanon = `https://www.newon.app/${p.lang}/babylog/${p.nav.sub ? p.nav.sub + "/" : ""}`;
  const hl = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  const hlOk = hl.length === 10 && LANGS.every((l) => hl.some((m) => m[1] === HREFLANG[l] && m[2] === `https://www.newon.app/${l}/babylog/${p.nav.sub ? p.nav.sub + "/" : ""}`)) && hl.some((m) => m[1] === "x-default");
  const og = ["og:title", "og:description", "og:url", "og:type"].filter((k) => !h.includes(`property="${k}"`));
  const lds = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let ldOk = lds.length >= 2;
  for (const m of lds) {
    try {
      JSON.parse(m[1]);
    } catch {
      ldOk = false;
    }
  }
  rec(`seo ${tag}`, title.length > 8 && desc.length > 40 && canon === wantCanon && hlOk && og.length === 0 && ldOk, `canonical ${canon === wantCanon}, hreflang ${hl.length}, og missing ${og.join(",") || "-"}, jsonld ${lds.length} ${ldOk}`);
  const tk = `${p.lang}`;
  if (!titles.has(tk)) titles.set(tk, []);
  titles.get(tk).push(title);
  if (!descs.has(tk)) descs.set(tk, []);
  descs.get(tk).push(desc);

  /* ---- a11y (static) ---- */
  const hs = [...strip(h).matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  const h1 = hs.filter((x) => x === 1).length;
  let skip = false;
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skip = true;
  const emptyA = count(body, /<a [^>]*>\s*<\/a>/g);
  const emptyB = count(body, /<button[^>]*>\s*<\/button>/g);
  const navLabel = /<nav class="fsn" data-biz="babylog" aria-label="[^"]+"/.test(h);
  rec(`a11y ${tag}`, h1 === 1 && !skip && !emptyA && !emptyB && navLabel, `h1 ${h1}, level-skip ${skip}, empty links ${emptyA}, empty buttons ${emptyB}, nav labels ${navLabel}`);

  /* ---- info-only ---- */
  const ctl = count(strip(body), /<(form|input|select|textarea)\b/gi) + count(body, /type="password"|autocomplete="cc-|<[^>]+(name|id|class)="[^"]*(card-number|checkout|payment-form)/gi);
  rec(`info-only ${tag}`, ctl === 0, `${ctl} interactive form/payment controls`);

  /* ---- child safety: plan label, emergency routing, no external links, no child imagery ---- */
  {
    const csPage = ["platform", "business", "contact"].includes(p.nav.id);
    const hasPlan = !["platform", "business"].includes(p.nav.id) || body.includes(p.lang === "ko" ? "공식 기관 연결을 중심으로 하는 추진 분야" : "planned areas focused on official information");
    const emerg = !csPage || /bl-emergency/.test(body);
    const ext = [...body.matchAll(/ href="(https?:[^"]+)"/g)].map((m) => m[1]).filter((u) => !/apps\.apple\.com|play\.google\.com/.test(u));
    // The owner-chosen first-screen background film (landscape, no children) is the only allowed media.
    const bodyNoHeroFilm = body.replace(/<video class="nls-film__video"[\s\S]*?<\/video>/, "");
    const img = count(bodyNoHeroFilm, /<img\b|<picture\b|<video\b|background-image/gi);
    const claims = /(공식 파트너|official partner|협약 체결|제휴 기관 목록)/i.test(text(body));
    rec(`child-safety ${tag}`, hasPlan && emerg && ext.length === 0 && img === 0 && !claims, `plan label ${hasPlan}, emergency note ${emerg}, external links ${ext.length}, images ${img}, partner claims ${claims}`);
  }

  /* ---- revenue (public/private split) ---- */
  const t = text(body);
  const bad = [
    /₩\s?\d/, /\d[\d,]*\s?원(?!칙|래|문|인|본|활|천|격|하|스|점)/, /\d+(\.\d+)?\s?%/, /\d+\s?~\s?\d+\s?%/,
    /(KRW|USD|EUR|\$)\s?\d/, /\b\d{1,3},\d{3}\b/, /월\s?\d+\s?만/, /19,?900/, /169,?000/, /179,?000/,
  ].filter((re) => re.test(t));
  rec(`revenue ${tag}`, bad.length === 0, bad.length ? `price/fee pattern: ${bad.map(String).join(" ")}` : "no price, rate or internal figure");

  /* ---- status & translation ---- */
  const labels = ["live", "prep", "plan"].filter((k) => body.includes(`bl-status--${k}`));
  const needLabels = ["overview", "platform", "business"].includes(p.nav.id) ? 3 : 0;
  const fb = !["ko", "en"].includes(p.lang);
  const langAttr = /id="lifestage-detail"[^>]*\slang="en"/.test(body);
  rec(`status ${tag}`, labels.length >= needLabels && langAttr === fb, `labels ${labels.join(",") || "-"}, fallback lang=en ${langAttr} (expected ${fb})`);
}

for (const [lang, ts] of titles) {
  rec(`seo-unique-title ${lang}`, new Set(ts).size === ts.length, `${new Set(ts).size}/${ts.length}`);
}
for (const [lang, ds] of descs) {
  rec(`seo-unique-desc ${lang}`, new Set(ds).size === ds.length, `${new Set(ds).size}/${ds.length}`);
}

/* ---- links ---- */
{
  let total = 0;
  const bad = [];
  const anchorCache = new Map();
  const idsOf = (rel) => {
    if (!anchorCache.has(rel)) anchorCache.set(rel, new Set([...read(rel).matchAll(/ id="([^"]+)"/g)].map((m) => m[1])));
    return anchorCache.get(rel);
  };
  for (const p of pages) {
    const body = mainOf(html.get(p.file));
    for (const m of body.matchAll(/ href="([^"]+)"/g)) {
      const href = m[1];
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      total++;
      const [pathPart, hash] = href.split("#");
      const [pth, query] = pathPart.split("?");
      let rel = pth ? pth.replace(/^\//, "") : path.dirname(p.file) + "/";
      if (pth && !rel.endsWith(".html") && !rel.endsWith("/")) rel += "/";
      const file = rel.endsWith(".html") ? rel : rel + "index.html";
      if (!exists(file)) {
        bad.push(`${p.file} → ${href} (no file)`);
        continue;
      }
      if (hash && !idsOf(file).has(hash) && !(/business\/inquiry\//.test(pth) && hash === "inquiry")) bad.push(`${p.file} → ${href} (no #${hash})`);
      if (/business\/inquiry\//.test(pth) && !/category=Partnership&source=babylog-/.test(query || "")) bad.push(`${p.file} → ${href} (inquiry without BABYLOG source)`);
    }
  }
  rec("links", bad.length === 0, `${total} internal links checked${bad.length ? "; " + bad.slice(0, 6).join(" | ") : ""}`);
  const inqHash = read("ko/business/inquiry/index.html").includes('id="inquiry"');
  rec("inquiry-anchor", inqHash, "existing inquiry page has #inquiry");
}

/* ---- stores / delete-account ---- */
{
  const verified = new Set([BUSINESS.babylog.stores.appStore, BUSINESS.babylog.stores.googlePlay]);
  let ok = true;
  const found = [];
  for (const lang of LANGS) {
    const h = html.get(pageFile(lang, "platform"));
    const urls = [...mainOf(h).matchAll(/href="(https:\/\/(?:apps\.apple\.com|play\.google\.com)[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    if (urls.length !== 2 || !urls.every((u) => verified.has(u))) ok = false;
    found.push(urls.length);
    const others = LANGS.length && BL_NAV.filter((n) => n.id !== "platform").some((n) => /apps\.apple\.com|play\.google\.com/.test(mainOf(html.get(pageFile(lang, n.sub)))));
    if (others) ok = false;
  }
  rec("stores", ok, `only the 2 verified store URLs, on the Platform page only (${found.join(",")})`);
  rec("delete-account", LANGS.every((l) => exists(`${l}/babylog/delete-account/index.html`)) && exists("babylog/delete-account/index.html"), "delete-account pages present (9 locales + root)");
}

/* ---- sitemap ---- */
{
  if (exists("sitemap.xml")) {
    const sm = read("sitemap.xml");
    const miss = pages.filter((p) => !sm.includes(`<loc>https://www.newon.app/${p.lang}/babylog/${p.nav.sub ? p.nav.sub + "/" : ""}</loc>`));
    rec("sitemap", miss.length === 0, `${pages.length - miss.length}/${pages.length} urls${miss.length ? " missing e.g. " + miss[0].file : ""}`);
  } else rec("sitemap", false, "sitemap.xml missing");
}

/* ---- scope / non-regression against a git ref ---- */
if (AGAINST) {
  const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
  const git = (...a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "buffer", maxBuffer: 1 << 28 });
  const watch = [];
  for (const l of LANGS) for (const s of ["petlog", "myworld", "shareon", "lifestage", "ongil", "ai", "business", "studio", "company", "business-hub"]) watch.push(`${l}/${s}/index.html`);
  watch.push(
    "home-lifestage.css", "home-lifestage-layout.css", "home-lifestage.js", "templates/hub-shell.html",
    "scripts/render-lifestage.mjs", "scripts/home-lifestage-body.mjs", "scripts/home-lifestage-copy.mjs",
    "scripts/site-chrome.mjs", "scripts/render-business-intro.mjs", "scripts/six-businesses.mjs"
  );
  const changed = [];
  let compared = 0;
  for (const f of watch) {
    let ref;
    try {
      ref = git("show", `${AGAINST}:${f}`);
    } catch {
      continue; // not in ref
    }
    compared++;
    if (!exists(f) || sha(fs.readFileSync(path.join(ROOT, f))) !== sha(ref)) changed.push(f);
  }
  rec("scope", changed.length === 0, `${compared} protected files/pages byte-identical to ${AGAINST}${changed.length ? "; CHANGED: " + changed.slice(0, 8).join(", ") : ""}`);
} else {
  results.push({ check: "scope", ok: null, detail: "NOT RUN (pass --against <git-ref>)" });
}

function finish() {
  const fails = results.filter((r) => r.ok === false);
  const groups = {};
  for (const r of results) {
    const g = r.check.split(" ")[0];
    (groups[g] ||= { pass: 0, fail: 0, notRun: 0 });
    if (r.ok === true) groups[g].pass++;
    else if (r.ok === false) groups[g].fail++;
    else groups[g].notRun++;
  }
  for (const [g, v] of Object.entries(groups)) console.log(`${v.fail ? "FAIL" : v.notRun ? "NOT RUN" : "PASS"} ${g}: ${v.pass} ok${v.fail ? `, ${v.fail} failed` : ""}${v.notRun ? `, ${v.notRun} not run` : ""}`);
  if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify({ root: ROOT, against: AGAINST || null, results }, null, 1));
  console.log(`qa-babylog-site: ${fails.length ? "FAIL" : "PASS"} · ${results.length} checks · ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
}
finish();
