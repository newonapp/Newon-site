#!/usr/bin/env node
/** Fix home aboutCard / workCard HTML by translating text nodes only. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate as googleTranslate } from "@vitalets/google-translate-api";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const GOOGLE_LANG = { ja: "ja", es: "es", "pt-br": "pt", fr: "fr", de: "de", hi: "hi", id: "id" };
const KEYS = [
  "aboutCard0Html",
  "aboutCard1Html",
  "aboutCard2Html",
  "aboutCard3Html",
  "aboutCard4Html",
  "workCard0Html",
  "workCard1Html",
  "workCard2Html",
  "workCard3Html",
  "workCard4Html",
  "workCard5Html",
];
const KEEP = /^(Newon\+|12\+|177|13|1000\+|Global)$/i;

const cachePath = path.join(ROOT, "scripts/.translate-cache.json");
const cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
const en = JSON.parse(fs.readFileSync(path.join(ROOT, "locales/en.json"), "utf8"));

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateGtx(text, tl) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", tl);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  const res = await fetch(url);
  const data = await res.json();
  return (data[0] || []).map((c) => c?.[0]).filter(Boolean).join("");
}

async function tr(text, lang) {
  if (!/[A-Za-z]{3,}/.test(text)) return text;
  if (KEEP.test(text.trim())) return text;
  const key = `en|${GOOGLE_LANG[lang]}\u0000${text}`;
  let out;
  try {
    out = await translateGtx(text, GOOGLE_LANG[lang]);
  } catch {
    out = (await googleTranslate(text, { from: "en", to: GOOGLE_LANG[lang] })).text;
  }
  cache[key] = out;
  await sleep(80);
  return out;
}

async function translateHtml(html, lang) {
  const parts = html.split(/(<[^>]+>)/g);
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (p.startsWith("<")) {
      out.push(p);
      continue;
    }
    const trimmed = p.trim();
    if (!trimmed) {
      out.push(p);
      continue;
    }
    if (KEEP.test(trimmed)) {
      out.push(p);
      continue;
    }
    const translated = await tr(trimmed, lang);
    out.push(p.replace(trimmed, translated));
  }
  return out.join("");
}

function isBroken(html) {
  if (!html) return true;
  if (!html.includes("<span") || !html.includes("</span>")) return true;
  if (/^\d/.test(html) && !html.includes("class=")) return true;
  return false;
}

for (const lang of TARGET) {
  const file = path.join(ROOT, "locales", `${lang}.json`);
  const loc = JSON.parse(fs.readFileSync(file, "utf8"));
  let n = 0;
  for (const k of KEYS) {
    const enHtml = en.home[k];
    if (!enHtml) continue;
    if (!isBroken(loc.home[k]) && lang !== "ja") continue;
    loc.home[k] = await translateHtml(enHtml, lang);
    n++;
    console.log(lang, k, "=>", loc.home[k]);
  }
  fs.writeFileSync(file, JSON.stringify(loc, null, 2) + "\n");
  console.log(lang, "fixed", n);
}

fs.writeFileSync(cachePath, JSON.stringify(cache));
console.log("fix-home-card-html: OK");
