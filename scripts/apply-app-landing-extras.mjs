#!/usr/bin/env node
/**
 * Inject shared landing sections into all app shells + sync locale keys.
 * Also reframes unverified “user stories” as usage situations.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  APP_LANDING,
  localeKeysForApp,
  glanceHtml,
  valuesHtml,
  beforeAfterHtml,
  faqHtml,
  privacyHtml,
  relatedHtml,
  finalCtaHtml,
  showcaseHeadHtml,
} from "./app-landing-extras.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const LOCALES = path.join(ROOT, "locales");
const TPL = path.join(ROOT, "templates");
const SITE_LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

const SP_FILE_BY_LANG = {
  ko: "_sp.ko.json",
  en: "_sp.en.json",
  ja: "_sp.ja.json",
  es: "_sp.es.json",
  "pt-br": "_sp.pt-br.json",
  fr: "_sp.fr.json",
  de: "_sp.de.json",
  hi: "_sp.hi.json",
  id: "_sp.id.json",
};

const LANDING_KEY_RE =
  /^(heroValueLine|glance[A-Za-z0-9]*|values?[A-Za-z0-9]*|value\d|ba(Label|Title|Before|After|\d)|compare[A-Za-z0-9]*|preview[A-Za-z0-9]*|faq\d|privacy[A-Za-z0-9]*|related[A-Za-z0-9]*|finalCta[A-Za-z0-9]*|statusReleased)/;

function stripLandingKeys(obj) {
  for (const k of Object.keys(obj)) {
    if (LANDING_KEY_RE.test(k)) delete obj[k];
  }
}

function keysFor(lang, app) {
  return localeKeysForApp(lang === "ko" ? "ko" : "en", app);
}

/** Sync locale JSON namespaces */
for (const lang of SITE_LANGS) {
  const localePath = path.join(LOCALES, `${lang}.json`);
  if (!fs.existsSync(localePath)) continue;
  const j = JSON.parse(fs.readFileSync(localePath, "utf8"));

  for (const app of APP_LANDING) {
    if (!j[app.ns]) continue;
    stripLandingKeys(j[app.ns]);
    Object.assign(j[app.ns], keysFor(lang, app));

    // Stronger hero one-liner: keep existing subtitle structure, add dedicated line
    // Also update meta title description helpers when present
    if (lang === "ko" || lang === "en") {
      const line = keysFor(lang, app).heroValueLine;
      if (line) j[app.ns].heroValueLine = line;
    }
  }

  // Keep how titles emoji-free in copy (icon lives in HTML)
  for (const app of APP_LANDING) {
    if (!j[app.ns]) continue;
    if (typeof j[app.ns].howTitle === "string") {
      j[app.ns].howTitle = j[app.ns].howTitle.replace(/^📖\s*/, "");
    }
  }

  // SEO: refresh per-app document titles when meta keys exist
  if (j.meta) {
    const map = {
      ox: "titleOx",
      sp: "titleSp",
      pm: "titlePillmate",
      sv: "titleSavy",
      bl: "titleBabylog",
      pl: "titlePetlog",
      pu: "titlePiggyup",
      gu: "titleGoalup",
      cu: "titleCountup",
      np: "titleNewonPlus",
      mw: "titleMyworld",
      eo: "titleEaton",
      fo: "titleFiton",
    };
    for (const app of APP_LANDING) {
      const key = map[app.ns];
      if (!key || j.meta[key] == null) continue;
      if (app.ns === "eo") {
        j.meta.titleEaton =
          lang === "ko"
            ? "EatOn | 요리·외식·배달·AI 레시피 통합 푸드 플랫폼 | Newon"
            : "EatOn | Cooking · Dining · Delivery · AI Recipes Food Platform | Newon";
        j.meta.descEaton =
          lang === "ko"
            ? "EatOn은 YouTube, Instagram, Blog의 인기 레시피부터 AI 레시피 요약, 유명 맛집, 배달 음식, 재료 쇼핑까지 한곳에서 탐색하는 통합 푸드 플랫폼입니다."
            : "EatOn brings popular recipes from YouTube, Instagram, and blogs together with AI recipe summaries, restaurant discovery, delivery exploration, and ingredient shopping.";
        if (typeof j.meta.keywords === "string" && !/\bEatOn\b/.test(j.meta.keywords)) {
          j.meta.keywords = j.meta.keywords.includes("My World")
            ? j.meta.keywords.replace("My World", "My World, EatOn")
            : `${j.meta.keywords}, EatOn`;
        }
        continue;
      }
      if (app.ns === "fo") {
        j.meta.titleFiton =
          lang === "ko"
            ? "FitOn | 운동·스포츠·AI 운동 분석 통합 플랫폼 | Newon"
            : "FitOn | Workout · Sports · AI Analysis Platform | Newon";
        j.meta.descFiton =
          lang === "ko"
            ? "FitOn은 러닝, 헬스, 홈트, 축구, 농구, 테니스 등 다양한 운동과 스포츠를 기록하고 AI 분석, 커뮤니티, 챌린지, 스포츠 쇼핑까지 연결하는 통합 피트니스 플랫폼입니다."
            : "FitOn connects running, gym, home workouts, soccer, basketball, tennis, and more with AI analysis, community, challenges, and sports shopping.";
        if (typeof j.meta.keywords === "string" && !/\bFitOn\b/.test(j.meta.keywords)) {
          j.meta.keywords = j.meta.keywords.includes("EatOn")
            ? j.meta.keywords.replace("EatOn", "EatOn, FitOn")
            : `${j.meta.keywords}, FitOn`;
        }
        continue;
      }
      const line = keysFor(lang, app).heroValueLine;
      if (!line) continue;
      j.meta[key] = `${app.name} — ${line}`;
      const descKey = key.replace(/^title/, "desc");
      if (j.meta[descKey] != null) {
        j.meta[descKey] = line;
      } else {
        j.meta[descKey] = line;
      }
    }
  }

  fs.writeFileSync(localePath, JSON.stringify(j, null, 2) + "\n", "utf8");

  // SubPing fragment locales
  const spFile = SP_FILE_BY_LANG[lang];
  if (spFile) {
    const p = path.join(LOCALES, spFile);
    if (fs.existsSync(p)) {
      const sp = JSON.parse(fs.readFileSync(p, "utf8"));
      const app = APP_LANDING.find((a) => a.ns === "sp");
      stripLandingKeys(sp);
      Object.assign(sp, keysFor(lang, app));
      fs.writeFileSync(p, JSON.stringify(sp, null, 2) + "\n", "utf8");
    }
  }
}

function removeSection(html, id) {
  const re = new RegExp(
    `\\s*<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/section>`,
    "m"
  );
  return html.replace(re, "");
}

function insertBefore(html, markerRe, block) {
  if (!markerRe.test(html)) return html;
  return html.replace(markerRe, `${block}\n\n$&`);
}

function insertAfterMatch(html, findRe, block) {
  if (!findRe.test(html)) return html;
  return html.replace(findRe, (m) => `${m}\n\n${block}`);
}

function ensureHeroValue(html, ns) {
  if (html.includes(`class="ox-hero-value">{{t:${ns}.heroValueLine}}`)) return html;
  const reachRe = new RegExp(
    `(id="${ns}-top"[\\s\\S]*?<p class="ox-subtitle">[\\s\\S]*?<\\/p>)`,
    "m"
  );
  if (reachRe.test(html)) {
    return html.replace(
      reachRe,
      `$1\n              <p class="ox-hero-value">{{t:${ns}.heroValueLine}}</p>`
    );
  }
  return html;
}

function ensureShowcaseHead(html, ns) {
  const headMarker = `id="${ns}-preview-title"`;
  const iconHtml = `<span class="ox-section-title-inline__icon" aria-hidden="true">📱</span>`;

  // Upgrade existing preview title with emoji if missing
  if (html.includes(headMarker)) {
    const titleRe = new RegExp(
      `(<h2\\b[^>]*\\bid="${ns}-preview-title"[^>]*>)([\\s\\S]*?)(<\\/h2>)`,
      "m"
    );
    return html.replace(titleRe, (full, open, inner, close) => {
      if (inner.includes("ox-section-title-inline__icon") || /📱/.test(inner)) {
        return full;
      }
      const bare = inner.replace(/^\s+|\s+$/g, "");
      return `${open}${iconHtml} ${bare}${close}`;
    });
  }

  const scrollIds = [
    `${ns}-showcase-scroll`,
    ns === "ox" ? "ox-month-showcase-scroll" : null,
    ns === "ox" ? "ox-showcase-panels" : null,
  ].filter(Boolean);

  for (const sid of scrollIds) {
    const re = new RegExp(
      `(<section\\b[^>]*\\bid="${sid}"[^>]*>\\s*<div class="ox-container">)`,
      "m"
    );
    if (re.test(html)) {
      return html.replace(re, `$1\n            ${showcaseHeadHtml(ns)}`);
    }
  }
  return html;
}

function ensureHowTitleEmoji(html, ns) {
  const re = new RegExp(
    `(<h2\\b[^>]*\\bid="${ns}-how-title"[^>]*>)([\\s\\S]*?)(<\\/h2>)`,
    "m"
  );
  return html.replace(re, (full, open, inner, close) => {
    if (inner.includes("ox-section-title-inline__icon")) return full;
    if (/📖/.test(inner)) {
      // Move inline emoji into icon span
      const cleaned = inner.replace(/📖\s*/g, "").trim();
      return `${open}<span class="ox-section-title-inline__icon" aria-hidden="true">📖</span>\n                ${cleaned}${close}`;
    }
    return `${open}<span class="ox-section-title-inline__icon" aria-hidden="true">📖</span>\n                ${inner.trim()}${close}`;
  });
}

function ensureFeaturesTitleEmoji(html, ns) {
  const re = new RegExp(
    `(<h2\\b[^>]*\\bid="${ns}-features-title"[^>]*>)([\\s\\S]*?)(<\\/h2>)`,
    "m"
  );
  return html.replace(re, (full, open, inner, close) => {
    if (inner.includes("ox-section-title-inline__icon") || /🚀/.test(inner)) return full;
    return `${open}\n                <span class="ox-section-title-inline__icon" aria-hidden="true">🚀</span>\n                ${inner.trim()}\n              ${close}`;
  });
}

function removePreviewCaptions(html) {
  return html.replace(
    /\s*<figcaption class="al-preview-cap">[\s\S]*?<\/figcaption>/g,
    ""
  );
}

function injectAppSections(html, app) {
  const { ns } = app;
  let out = html;

  // Remove previous injected blocks (idempotent)
  for (const id of [
    `${ns}-glance`,
    `${ns}-values`,
    `${ns}-ba`,
    `${ns}-compare`,
    `${ns}-faq`,
    `${ns}-privacy`,
    `${ns}-related`,
    `${ns}-final-cta`,
  ]) {
    out = removeSection(out, id);
  }

  out = ensureHeroValue(out, ns);
  out = ensureShowcaseHead(out, ns);
  out = ensureHowTitleEmoji(out, ns);
  out = ensureFeaturesTitleEmoji(out, ns);
  out = removePreviewCaptions(out);

  // Glance before intro
  out = insertBefore(
    out,
    new RegExp(`\\s*<section\\b[^>]*\\bid="${ns}-intro"`, "m"),
    glanceHtml(ns)
  );

  // Values + BA before features (after reviews if present)
  const valuesBlock = `${valuesHtml(ns)}\n\n${beforeAfterHtml(ns)}`;
  out = insertBefore(
    out,
    new RegExp(`\\s*<section\\b[^>]*\\bid="${ns}-features"`, "m"),
    valuesBlock
  );

  // FAQ + privacy after reco, before closing
  const faqBlock = `${faqHtml(ns)}\n\n${privacyHtml(ns)}`;
  const closingIds = [`${ns}-closing-highlight`, `${ns}-closing`];
  let faqInserted = false;
  for (const cid of closingIds) {
    const next = insertBefore(
      out,
      new RegExp(`\\s*<section\\b[^>]*\\bid="${cid}"`, "m"),
      faqBlock
    );
    if (next !== out) {
      out = next;
      faqInserted = true;
      break;
    }
  }
  if (!faqInserted) {
    // fallback: after reco
    out = insertAfterMatch(
      out,
      new RegExp(`<section\\b[^>]*\\bid="${ns}-reco"[\\s\\S]*?<\\/section>`, "m"),
      faqBlock
    );
  }

  // Final CTA + related after closing highlight
  const ctaBlock = `${finalCtaHtml(ns)}\n\n${relatedHtml(ns, APP_LANDING)}`;
  let ctaInserted = false;
  for (const cid of closingIds) {
    const next = insertAfterMatch(
      out,
      new RegExp(`<section\\b[^>]*\\bid="${cid}"[\\s\\S]*?<\\/section>`, "m"),
      ctaBlock
    );
    if (next !== out) {
      out = next;
      ctaInserted = true;
      break;
    }
  }
  // Single-app includes: fall back to footer only when this file has one footer
  if (!ctaInserted && (out.match(/<footer class="ox-footer">/g) || []).length === 1) {
    out = insertBefore(
      out,
      new RegExp(`\\s*<footer class="ox-footer">`, "m"),
      ctaBlock
    );
  }

  return out;
}

const templateFiles = fs
  .readdirSync(TPL)
  .filter(
    (f) =>
      f.endsWith("-app-inc.html") ||
      f === "index.html" ||
      f === "subping-page.html"
  );

for (const name of templateFiles) {
  const p = path.join(TPL, name);
  let html = fs.readFileSync(p, "utf8");
  let changed = false;

  for (const app of APP_LANDING) {
    // Only patch files that contain this app's intro or features
    if (!html.includes(`id="${app.ns}-intro"`) && !html.includes(`id="${app.ns}-features"`)) {
      continue;
    }
    const next = injectAppSections(html, app);
    if (next !== html) {
      html = next;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(p, html, "utf8");
    console.log(`apply-app-landing-extras: patched ${name}`);
  }
}

console.log("apply-app-landing-extras: OK");
