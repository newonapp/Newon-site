#!/usr/bin/env node
/**
 * Translation SOURCE CANDIDATES (P6) — lossless extraction, NOT an approval and NOT applied by any build.
 *
 * Background (docs/web-closure/PHASE03-P5-BUILD-DRIFT.md): a clean build writes English into some places where the committed
 * files hold German, Japanese, ... text. That committed text is not derivable from any tracked source (it came from a
 * gitignored machine-translation cache). If someone commits a build output, it is lost. This tool records every such
 * difference as a reviewable candidate record so nothing is lost, without deciding which side is right.
 *
 *   node scripts/extract-translation-candidates.mjs --built <git work tree after ONE clean build> [--out i18n-candidates] [--base <label>]
 *       writes <out>/translation-candidates.v1.json and <out>/translation-candidates.v1.tsv
 *   node scripts/extract-translation-candidates.mjs --built <dir> --verify [--out i18n-candidates]
 *       checks that (1) every non-ko/en content difference of the built tree is covered by a record and
 *       (2) re-applying the records to the built output reproduces the committed files (nothing lost). Exit 0 = PASS.
 *
 * Record fields: id, lang, page (file), kind (html-hunk | json-key), locator,  sourceBuilt / tokens.built (what the build emits today),
 * currentCommitted (what is committed today), origin, reviewStatus ("unreviewed" always: nobody approved anything).
 * Rules: ko and en files are never extracted; the build is never switched to these candidates (no code reads them).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { spawnSync } from "child_process";

const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);
const BUILT = path.resolve(opt("--built") || ".");
const OUT = path.resolve(opt("--out") || path.join(path.dirname(new URL(import.meta.url).pathname), "..", "i18n-candidates"));
const VERIFY = argv.includes("--verify");
const LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const FILE = path.join(OUT, "translation-candidates.v1.json");

function git(args) {
  return spawnSync("git", args, { cwd: BUILT, encoding: "buffer", maxBuffer: 1 << 29 });
}
if (String(git(["rev-parse", "--is-inside-work-tree"]).stdout).trim() !== "true") {
  console.error("extract-translation-candidates: --built must be a git work tree (NOT RUN)");
  process.exit(2);
}

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const collapse = (s) => s.replace(/\s+/g, " ").trim();
/* same masking as qa-build-drift: timestamps are not translations */
function mask(rel, s) {
  if (rel === "sitemap.xml") s = s.replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod>-</lastmod>");
  if (rel === "admin/data.json") s = s.replace(/"generatedAt":\s*"[^"]*"/g, '"generatedAt": "-"');
  return s;
}
function langOf(rel) {
  const seg = rel.split("/")[0];
  if (LANGS.includes(seg)) return seg;
  const m = /^locales\/(?:_sp\.)?([a-z-]+)\.json$/.exec(rel);
  return m && LANGS.includes(m[1]) ? m[1] : null;
}

/* ---- HTML: token stream (tags and text, whitespace-normalised), hunks from the system `diff` ---- */
import os from "os";
const tokenize = (html) => html.split(/(<[^>]+>)/).map(collapse).filter((t) => t !== "");
const plain = (toks) => collapse(toks.filter((t) => !t.startsWith("<")).join(" "));
function diffHtml(rel, committed, built) {
  const a = tokenize(committed), b = tokenize(built);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tc-"));
  fs.writeFileSync(path.join(tmp, "c"), a.join("\n") + "\n");
  fs.writeFileSync(path.join(tmp, "b"), b.join("\n") + "\n");
  const r = spawnSync("diff", ["--minimal", path.join(tmp, "b"), path.join(tmp, "c")], { encoding: "utf8", maxBuffer: 1 << 29 });
  fs.rmSync(tmp, { recursive: true, force: true });
  if (r.status !== 0 && r.status !== 1) return { structural: `diff failed (${r.status})` };
  const rec = [];
  /* normal diff format: "3,5c7,9" (change) / "4a8,9" (add to built = committed has more) / "6,7d10" (built has more) */
  for (const m of r.stdout.matchAll(/^(\d+)(?:,(\d+))?([acd])(\d+)(?:,(\d+))?$/gm)) {
    const [, b1, b2, op, c1, c2] = m;
    const bs = op === "a" ? Number(b1) : Number(b1) - 1, bn = op === "a" ? 0 : (b2 ? Number(b2) : Number(b1)) - Number(b1) + 1;
    const cs = op === "d" ? Number(c1) : Number(c1) - 1, cn = op === "d" ? 0 : (c2 ? Number(c2) : Number(c1)) - Number(c1) + 1;
    const builtToks = b.slice(bs, bs + bn), committedToks = a.slice(cs, cs + cn);
    rec.push({
      kind: "html-hunk", locator: `built-tokens:${bs}+${bn}`,
      sourceBuiltText: plain(builtToks) || builtToks.join(" "), currentCommittedText: plain(committedToks) || committedToks.join(" "),
      tokens: { built: builtToks, committed: committedToks },
    });
  }
  return { rec, committedTokens: a, builtTokens: b };
}
function applyHtml(builtTokens, records) {
  const t = builtTokens.slice();
  for (const r of [...records].reverse()) {
    const m = /^built-tokens:(\d+)\+(\d+)$/.exec(r.locator);
    t.splice(Number(m[1]), Number(m[2]), ...r.tokens.committed);
  }
  return t;
}

/* ---- JSON: leaf keys ---- */
function diffJson(committed, built) {
  let a, b;
  try { a = JSON.parse(committed); b = JSON.parse(built); } catch (e) { return { structural: "invalid JSON: " + e.message }; }
  const rec = [];
  (function walk(x, y, p) {
    if (x && y && typeof x === "object" && typeof y === "object" && !Array.isArray(x) && !Array.isArray(y)) {
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) walk(x[k], y[k], p ? `${p}.${k}` : k);
    } else if (JSON.stringify(x) !== JSON.stringify(y)) {
      rec.push({ kind: "json-key", locator: p, sourceBuilt: y === undefined ? null : y, currentCommitted: x === undefined ? null : x, ...(x === undefined ? { note: "key absent in committed file" } : {}), ...(y === undefined ? { note: "key absent in built output" } : {}) });
    }
  })(a, b, "");
  return { rec };
}
function applyJson(built, records) {
  const b = JSON.parse(built);
  for (const r of records) {
    const parts = r.locator.split(".");
    let o = b;
    for (let i = 0; i < parts.length - 1; i += 1) { if (o[parts[i]] === undefined) o[parts[i]] = {}; o = o[parts[i]]; }
    if (r.currentCommitted === null && r.note === "key absent in committed file") delete o[parts.at(-1)];
    else o[parts.at(-1)] = r.currentCommitted;
  }
  return JSON.stringify(b);
}

/* ---- provenance hint: is the committed text present in a TRACKED NON-GENERATED source (as committed at HEAD)? ----
   A hint for reviewers only. It never changes which side is canonical. Sources: locales/, scripts/, templates/ at HEAD. */
import { execFileSync } from "child_process";
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const normSrc = (s) => dec(s).replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\n|\\"|\\'/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
let SOURCES = null;
function sources() {
  if (SOURCES) return SOURCES;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tcsrc-"));
  const tar = execFileSync("git", ["archive", "HEAD", "locales", "scripts", "templates"], { cwd: BUILT, maxBuffer: 1 << 30 });
  spawnSync("tar", ["x", "-C", tmp], { input: tar });
  SOURCES = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(json|mjs|js|html|txt|md)$/.test(e.name) && !/translate-cache|translation-candidates/.test(e.name)) SOURCES.push([path.relative(tmp, p), normSrc(fs.readFileSync(p, "utf8"))]);
    }
  })(tmp);
  fs.rmSync(tmp, { recursive: true, force: true });
  return SOURCES;
}
function trackedSource(text, lang) {
  const t = normSrc(text);
  if (t.length < 12 || !/[^\x00-\x7f]|[a-zA-Z]{4}/.test(t)) return undefined; /* too short to say */
  const own = sources().filter(([f]) => !/^locales\/(?:_sp\.)?[a-z-]+\.json$/.test(f) || f.includes(`.${lang}.json`) || f === `locales/${lang}.json`);
  for (const [f, b] of own) if (b.includes(t)) return f;
  return null;
}

/* ---- collect the drifted non-ko/en files of the built tree ---- */
const modified = String(git(["ls-files", "-m", "-z"]).stdout).split("\0").filter(Boolean);
const files = {};
const uncovered = [];
let nrec = 0;
for (const rel of modified) {
  const lang = langOf(rel);
  if (!lang) continue; /* ko/en and non-language files are not translation sources */
  const abs = path.join(BUILT, rel);
  if (!fs.existsSync(abs)) continue;
  const builtTxt = mask(rel, fs.readFileSync(abs, "utf8"));
  const head = git(["show", `HEAD:${rel}`]);
  if (head.status !== 0) continue;
  const committedTxt = mask(rel, head.stdout.toString("utf8"));
  const isJson = rel.endsWith(".json");
  if (collapse(committedTxt) === collapse(builtTxt)) continue; /* whitespace only */
  const d = isJson ? diffJson(committedTxt, builtTxt) : diffHtml(rel, committedTxt, builtTxt);
  if (d.structural) { files[rel] = { lang, structural: d.structural, committedSha256: sha(committedTxt), builtSha256: sha(builtTxt), records: [] }; uncovered.push(`${rel}: ${d.structural}`); continue; }
  const records = d.rec.map((r, n) => {
    const hint = r.kind === "json-key" ? undefined : trackedSource(r.currentCommittedText ?? "", lang);
    return { id: `${rel}#${n}`, lang, page: rel, ...r, trackedSource: hint, origin: hint ? "text is also present in a tracked source (see trackedSource); the build overwrites or does not use it" : "text found in the committed file only (not in a tracked non-generated source)", reviewStatus: "unreviewed" };
  });
  if (!isJson && records.length === 0) continue; /* only whitespace-level token differences */
  files[rel] = { lang, committedSha256: sha(committedTxt), builtSha256: sha(builtTxt), records };
  nrec += records.length;
  /* lossless check: built + records == committed */
  const ok = isJson
    ? applyJson(builtTxt, records) === JSON.stringify(JSON.parse(committedTxt))
    : JSON.stringify(applyHtml(d.builtTokens, records)) === JSON.stringify(d.committedTokens);
  files[rel].lossless = ok;
  if (!ok) uncovered.push(`${rel}: reconstruction differs from committed`);
}

const baseCommit = opt("--base") || String(git(["rev-parse", "--short", "HEAD"]).stdout).trim();
const prov = { inTrackedSource: 0, committedFileOnly: 0, tooShortToSay: 0 };
for (const f of Object.values(files)) for (const r of f.records) { if (r.kind === "json-key") continue; if (r.trackedSource) prov.inTrackedSource += 1; else if (r.trackedSource === null) prov.committedFileOnly += 1; else prov.tooShortToSay += 1; }
const perLang = {};
for (const f of Object.values(files)) { perLang[f.lang] = perLang[f.lang] || { files: 0, records: 0 }; perLang[f.lang].files += 1; perLang[f.lang].records += f.records.length; }

if (VERIFY) {
  if (!fs.existsSync(FILE)) { console.log("translation-candidates: FAIL (candidate file missing)"); process.exit(1); }
  const saved = JSON.parse(fs.readFileSync(FILE, "utf8"));
  const errors = [];
  for (const [rel, f] of Object.entries(files)) {
    const s = saved.files[rel];
    if (!s) { errors.push(`not covered: ${rel}`); continue; }
    if (s.committedSha256 !== f.committedSha256) errors.push(`committed text changed since extraction: ${rel}`);
    if (s.builtSha256 !== f.builtSha256) errors.push(`built output changed since extraction: ${rel}`);
    if (!f.structural && JSON.stringify(s.records.map((r) => [r.locator, r.sourceBuilt ?? r.tokens, r.currentCommitted ?? r.tokens])) !== JSON.stringify(f.records.map((r) => [r.locator, r.sourceBuilt ?? r.tokens, r.currentCommitted ?? r.tokens]))) errors.push(`records differ: ${rel}`);
  }
  for (const e of uncovered) errors.push(e);
  for (const e of errors.slice(0, 40)) console.error(`translation-candidates: ${e}`);
  console.log(`translation-candidates: ${errors.length ? "FAIL" : "PASS"} · ${Object.keys(files).length} drifted language file(s), ${nrec} record(s), saved ${Object.keys(saved.files).length}, errors ${errors.length}`);
  process.exit(errors.length ? 1 : 0);
}

fs.mkdirSync(OUT, { recursive: true });
const doc = {
  schema: "newon.translation-candidates.v1",
  status: "CANDIDATE: reviewStatus is 'unreviewed' for every record. Nothing here is approved as canonical and no build reads this file.",
  baseCommit,
  how: "node scripts/extract-translation-candidates.mjs --built <git work tree after one clean build>",
  counts: { files: Object.keys(files).length, records: nrec, structural: uncovered.length, provenance: prov, perLanguage: perLang },
  files: Object.fromEntries(Object.entries(files).sort(([x], [y]) => x.localeCompare(y))),
};
fs.writeFileSync(FILE, `${JSON.stringify(doc)}\n`);
const tsv = ["id\tlang\tpage\tkind\tlocator\tsourceBuilt\tcurrentCommitted\ttrackedSource\treviewStatus"];
const cell = (v) => String(v ?? "").replace(/\s+/g, " ").replace(/\t/g, " ");
for (const f of Object.values(doc.files)) for (const r of f.records) tsv.push([r.id, r.lang, r.page, r.kind, r.locator, cell(r.sourceBuiltText ?? r.sourceBuilt), cell(r.currentCommittedText ?? r.currentCommitted), r.trackedSource ?? "", r.reviewStatus].join("\t"));
fs.writeFileSync(path.join(OUT, "translation-candidates.v1.tsv"), `${tsv.join("\n")}\n`);
console.log(`translation-candidates: ${doc.counts.files} file(s), ${nrec} record(s), structural/uncovered ${uncovered.length}`);
console.log(`  provenance (html records): in a tracked source ${prov.inTrackedSource}, committed file only ${prov.committedFileOnly}, too short to say ${prov.tooShortToSay}`);
for (const [l, v] of Object.entries(perLang)) console.log(`  ${l}: ${v.files} file(s), ${v.records} record(s)`);
for (const e of uncovered.slice(0, 20)) console.error(`translation-candidates: ${e}`);
process.exit(uncovered.length ? 1 : 0);
