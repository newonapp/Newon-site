#!/usr/bin/env node
/**
 * Language-mix report for the 74 classified Business/Studio pages in all 9 languages.
 *
 * Reports (never guesses a translation, never edits a page):
 *   - missing   : a classified page that has no file in a language
 *   - lang attr : <html lang> that does not match the folder
 *   - mixed     : text lines of the page body that are written in English on a non-English page
 *                 (lines carrying lang="en" are counted separately: they are marked, intended fallbacks)
 *
 *   node scripts/qa-lang-mix.mjs [--json out.json] [--strict]
 *
 * --strict fails when a page is missing or has the wrong <html lang>. Mixed text is information, not a failure:
 * the 7 non-ko/en languages still reuse English body copy in many sections (see the P5 report).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "./business-model-pages.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const HTML_LANG = { ko: "ko", en: "en", ja: "ja", es: "es", "pt-br": "pt-BR", fr: "fr", de: "de", hi: "hi", id: "id" };
const EN_WORDS = new Set("the and with your for from that this are you our can will not have has into about more than their which when what how all one use used using work works build built design designed we it is of to in on as by or an be at a".split(" "));
const argv = process.argv.slice(2);
const strict = argv.includes("--strict");
const jsonOut = argv.includes("--json") ? argv[argv.indexOf("--json") + 1] : null;

function bodyLines(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0]
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, " ");
  const marked = new Set();
  // blocks explicitly marked lang="en"
  main.replace(/<(\w+)[^>]*\blang="en"[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, inner) => {
    marked.add(inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    return "";
  });
  const text = main
    .replace(/<\/(p|h[1-6]|li|div|section|span|a|dt|dd|td|th|button|summary|label|option)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const lines = text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length >= 25);
  return { lines, marked };
}

function looksEnglish(line, lang) {
  if (lang === "ko") return !/[가-힣]/.test(line) && /[A-Za-z]{4,}/.test(line) && englishScore(line) >= 2;
  if (lang === "ja") return !/[぀-ヿ一-鿿]/.test(line) && englishScore(line) >= 2;
  if (lang === "hi") return !/[ऀ-ॿ]/.test(line) && englishScore(line) >= 2;
  return englishScore(line) >= 3;
}
function englishScore(line) {
  return line.toLowerCase().split(/[^a-z']+/).filter((w) => EN_WORDS.has(w)).length;
}

const report = { missing: [], badLang: [], mixed: {}, marked: {} };
let pages = 0;
for (const lang of LANGS) {
  report.mixed[lang] = { pages: 0, lines: 0 };
  report.marked[lang] = 0;
  for (const key of Object.keys(PAGES)) {
    const f = path.join(ROOT, lang, key, "index.html");
    if (!fs.existsSync(f)) { report.missing.push(`${lang}/${key}`); continue; }
    pages += 1;
    const html = fs.readFileSync(f, "utf8");
    if (/http-equiv="refresh"/i.test(html) && !/<main\b/.test(html)) continue;
    const m = /<html[^>]*\blang="([^"]*)"/i.exec(html);
    if (!m || m[1] !== HTML_LANG[lang]) report.badLang.push(`${lang}/${key} (lang=${m ? m[1] : "none"})`);
    if (lang === "en") continue;
    const { lines, marked } = bodyLines(html);
    const markedText = [...marked].join(" ");
    const mixed = lines.filter((l) => looksEnglish(l, lang) && !markedText.includes(l.slice(0, 40)));
    report.marked[lang] += lines.filter((l) => markedText.includes(l.slice(0, 40))).length;
    if (mixed.length) { report.mixed[lang].pages += 1; report.mixed[lang].lines += mixed.length; }
  }
}
if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify(report, null, 1)}\n`);
console.log(`lang-mix: ${pages} pages · missing ${report.missing.length} · bad <html lang> ${report.badLang.length}`);
for (const l of LANGS.filter((x) => x !== "en")) {
  console.log(`lang-mix: ${l.padEnd(5)} pages with English body lines ${String(report.mixed[l].pages).padStart(3)} · lines ${String(report.mixed[l].lines).padStart(5)} · marked lang="en" lines ${report.marked[l]}`);
}
for (const e of report.missing.slice(0, 20)) console.error(`lang-mix: missing ${e}`);
for (const e of report.badLang.slice(0, 20)) console.error(`lang-mix: ${e}`);
process.exit(strict && (report.missing.length || report.badLang.length) ? 1 : 0);
