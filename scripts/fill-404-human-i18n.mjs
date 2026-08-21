#!/usr/bin/env node
/**
 * Build scripts/human404-i18n.json for all languages from fhKo / fhEn + MT.
 * Run: node scripts/fill-404-human-i18n.mjs [--force] [--lang=ja]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { translate as googleTranslate } from "@vitalets/google-translate-api";
import {
  fhKo,
  fhEn,
  fhTimeline,
  fhTimelineEn,
  FH_OG_LOCALE,
  FH_HTML_LANG,
} from "./human404-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(__dirname, "human404-i18n.json");
const CACHE_PATH = path.join(__dirname, ".translate-cache.json");

const TARGET_LANGS = ["ja", "es", "pt-br", "fr", "de", "hi", "id"];
const GOOGLE_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};
const MYMEMORY_LANG = {
  ja: "ja",
  es: "es",
  "pt-br": "pt-BR",
  fr: "fr",
  de: "de",
  hi: "hi",
  id: "id",
};

const force = process.argv.includes("--force");
const langArg = process.argv.find((a) => a.startsWith("--lang="));
const onlyLang = langArg ? langArg.split("=")[1] : null;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
}

function protect(text) {
  const tokens = [];
  const safe = String(text).replace(
    /(\[\[IMG:[^\]]+\]\]|\{\{[^}]+\}\}|https?:\/\/[^\s"'<>]+|mailto:[^\s"'<>]+|<[^>]+>|404:\s*HUMAN|HUMAN DETECTION|HUMANITY|HUMAN POPULATION|UNREGISTERED LIFE FORM DETECTED|UNREGISTERED LIFE FORM|ARE YOU HUMAN\?|WHAT MAKES YOU HUMAN\?|EVERY RESPONSE IS BEING ANALYZED\.|YOUR CHOICES ARE REMEMBERED\.|ONE UNREGISTERED LIFE FORM REMAINS\.|3 POSSIBLE OUTCOMES|PLAY GAME|PLAY 404: HUMAN|COMING SOON|CLASSIFIED|DATA LOCKED|DETECTED|ASSIMILATED|ESCAPE|FINAL CHOICE|METRIC \/\/ 0[12]|ENDING \/\/ 0[123]|LOG \/\/ 0[1-4]|AI INTERROGATION \/\/ 03|AI SCAN|INTERROGATION|CHOICE|ANALYSIS|CONSEQUENCE|NEXT SECTOR|SURVIVE\.|HIDE\.|ESCAPE\.|Flutter Web|Nawon Kyung|Newon|OX MONTH|SubPing|Pillmate|BabyLog|PetLog|PiggyUp|SAVY|GoalUp|CountUp|My World|Google Play|App Store|Instagram|YouTube|TikTok|Naver Blog)/gi,
    (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `[[[T${id}]]]`;
    }
  );
  return { safe, tokens };
}

function unprotect(text, tokens) {
  let out = String(text);
  for (let i = 0; i < tokens.length; i++) {
    out = out.replace(new RegExp(`\\[\\[\\[T${i}\\]\\]\\]`, "gi"), tokens[i]);
    out = out.replace(new RegExp(`\\[\\[T${i}\\]\\]`, "gi"), tokens[i]);
  }
  return out;
}

function shouldSkip(text) {
  if (text == null || typeof text !== "string") return true;
  const t = text.trim();
  if (!t) return true;
  if (/^https?:\/\//i.test(t) || /^mailto:/i.test(t)) return true;
  // Pure English diegetic / brand lines already protected or kept
  if (
    /^(OVERVIEW|MISSION|CORE IDEA|GAME LOOP|SYSTEM|PREVIEW|WORLD|SCENARIO|ENDING|DEVELOPMENT|GAMEPLAY PREVIEW|CREATOR'S NOTE|PROJECT|CREATOR|STUDIO|ROLE|TECH|WEB|VS|AI|WARNING|NEWON)$/i.test(
      t
    )
  ) {
    return true;
  }
  if (!/[a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(t)) return true;
  return false;
}

async function translateGtx(safe, targetLang) {
  const tl = GOOGLE_LANG[targetLang] || targetLang;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", tl);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", safe.slice(0, 4500));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`gtx HTTP ${res.status}`);
  const data = await res.json();
  const parts = (data[0] || []).map((chunk) => chunk?.[0]).filter(Boolean);
  if (!parts.length) throw new Error("gtx empty");
  return parts.join("");
}

async function translateText(text, targetLang, cache) {
  if (shouldSkip(text)) return text;
  const { safe, tokens } = protect(text);
  if (!safe.trim() || /^(\[\[\[T\d+\]\]\]|\s)*$/.test(safe)) return text;
  const key = `fh|en|${targetLang}|${safe}`;
  if (!force && cache[key]) return unprotect(cache[key], tokens);

  let translated;
  try {
    translated = await translateGtx(safe, targetLang);
  } catch {
    try {
      const res = await googleTranslate(safe, {
        from: "en",
        to: GOOGLE_LANG[targetLang] || targetLang,
      });
      translated = res.text;
    } catch {
      const pair = `en|${MYMEMORY_LANG[targetLang] || targetLang}`;
      const url = new URL("https://api.mymemory.translated.net/get");
      url.searchParams.set("q", safe.slice(0, 450));
      url.searchParams.set("langpair", pair);
      const res = await fetch(url);
      const data = await res.json();
      translated = data?.responseData?.translatedText || safe;
    }
  }
  const out = unprotect(translated, tokens);
  cache[key] = out;
  await sleep(120);
  return out;
}

async function mapDeep(value, fn) {
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await mapDeep(item, fn));
    return out;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = await mapDeep(v, fn);
    }
    return out;
  }
  if (typeof value === "string") return fn(value);
  return value;
}

function baseMeta(dir) {
  return {
    lang: dir,
    htmlLang: FH_HTML_LANG[dir] || dir,
    ogLocale: FH_OG_LOCALE[dir] || "en_US",
    homeHref: `/${dir}/`,
  };
}

async function main() {
  const cache = loadCache();
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

  const pack = {
    ko: {
      ...fhKo,
      ...baseMeta("ko"),
      timeline: fhTimeline,
    },
    en: {
      ...fhEn,
      ...baseMeta("en"),
      timeline: fhTimelineEn,
    },
  };

  const langs = onlyLang ? [onlyLang] : TARGET_LANGS;
  for (const dir of langs) {
    if (dir === "ko" || dir === "en") continue;
    process.stderr.write(`fill-404-human-i18n: ${dir}…\n`);
    const prev = existing[dir] && !force ? existing[dir] : null;
    const translated = await mapDeep(fhEn, async (s) => {
      // Prefer previous if identical structure and not forcing
      return translateText(s, dir, cache);
    });
    const timeline = [];
    for (const row of fhTimelineEn) {
      timeline.push({
        year: row.year,
        accent: row.accent,
        text: await translateText(row.text, dir, cache),
      });
    }
    pack[dir] = {
      ...(prev && !force ? prev : {}),
      ...translated,
      ...baseMeta(dir),
      timeline,
      // Keep intentional English game CTAs / diegetic lines
      playLabel: "PLAY GAME",
      playCtaFinal: "PLAY 404: HUMAN",
      comingSoon: "COMING SOON",
      h1: "404: HUMAN",
      missionEmphHtml: fhEn.missionEmphHtml,
      previewFoot: fhEn.previewFoot,
      ctaKicker: fhEn.ctaKicker,
      ctaLine: fhEn.ctaLine,
      ctaAsk: fhEn.ctaAsk,
      noteClosing: fhEn.noteClosing,
      endingFoot: fhEn.endingFoot,
      endingFootSub: fhEn.endingFootSub,
      end1Name: fhEn.end1Name,
      end2Name: fhEn.end2Name,
      end3Name: fhEn.end3Name,
      end1Lock: fhEn.end1Lock,
      end2Lock: fhEn.end2Lock,
      end3Lock: fhEn.end3Lock,
      dual1Title: fhEn.dual1Title,
      dual2Title: fhEn.dual2Title,
      sc3Quote: fhEn.sc3Quote,
      sc4Quote: fhEn.sc4Quote,
      instagramUrl: fhEn.instagramUrl,
      youtubeUrl: fhEn.youtubeUrl,
      footerRights: "© 404: HUMAN ·",
      newonLink: "Newon",
    };
    saveCache(cache);
  }

  // Preserve other langs from existing when --lang= subset
  for (const dir of TARGET_LANGS) {
    if (!pack[dir] && existing[dir]) pack[dir] = existing[dir];
  }

  fs.writeFileSync(OUT, JSON.stringify(pack, null, 2) + "\n", "utf8");
  saveCache(cache);
  console.log(
    `fill-404-human-i18n: wrote ${path.relative(ROOT, OUT)} (${Object.keys(pack).join(", ")})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
