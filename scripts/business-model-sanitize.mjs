#!/usr/bin/env node
/**
 * Business model sanitizer (PHASE 03).
 *
 * NEWON Business / Studio are NOT a customer-specific outsourcing (외주/개발 대행) business.
 * Until the product copy and prices are confirmed, this pass only HIDES price / quote / duration UI
 * from the Business · Studio pages and neutralizes "quote" call-to-action labels.
 *
 * - Never invents replacement prices, fees or dates.
 * - Never deletes pages, URLs, inquiry forms or inquiry data (query strings are untouched).
 * - Idempotent: running it twice yields the same output.
 *
 * Usage: node scripts/business-model-sanitize.mjs [--check] [root]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DEFAULT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];

/** Labels (any language) of "price" / "starting at" / "timeline" rows. */
const ROW_LABEL_RE =
  /^(price|starting at|timeline|estimated timeline|geschätzter zeitplan|예상 기간|시작가|prix|preis|precio|preço|価格|価格目安|harga|कीमत|मूल्य|प्रीमियम|prezzo|plazo(?: estimado)?|prazo(?: estimado)?|délai(?: estimé)?|durée estimée|geschätzte dauer|예상 일정|目安期間|想定期間|estimasi(?: waktu)?|अनुमानित समय(?:-सीमा)?|अनुमानित अवधि)$/i;

/** CTA label neutralization: quote / production-request → plain inquiry. */
const CTA_MAP = {
  ko: { "견적 문의 →": "문의하기 →", "제작 문의 →": "문의하기 →", "웹 프로젝트 문의 →": "문의하기 →", "프로젝트 상담하기 →": "문의하기 →" },
  en: { "Request a quote →": "Inquire →", "Production inquiry →": "Inquire →", "Start a consultation →": "Inquire →" },
  ja: { "見積依頼 →": "お問い合わせ →", "Production inquiry →": "お問い合わせ →" },
  es: { "Solicitar presupuesto →": "Consultar →", "Production inquiry →": "Consultar →" },
  "pt-br": { "Solicitar um orçamento →": "Entrar em contato →", "Production inquiry →": "Entrar em contato →" },
  fr: { "Demander un devis →": "Nous contacter →", "Production inquiry →": "Nous contacter →" },
  de: { "Fordern Sie ein Angebot an": "Anfrage senden", "Production inquiry →": "Anfrage senden" },
  hi: { "एक उद्धरण का अनुरोध करें →": "पूछताछ करें →", "Production inquiry →": "पूछताछ करें →" },
  id: { "Meminta kutipan →": "Ajukan pertanyaan →", "Production inquiry →": "Ajukan pertanyaan →" },
};

function matchEnd(html, start, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi");
  re.lastIndex = start;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      depth -= 1;
      if (depth === 0) return m.index + m[0].length;
    } else depth += 1;
  }
  return -1;
}

/** Remove every `<tag ...class="...cls...">…</tag>` block (balanced). */
function removeByClass(html, tag, clsRe, pred = () => true) {
  const open = new RegExp(`<${tag}\\b[^>]*class="[^"]*${clsRe}[^"]*"[^>]*>`, "gi");
  let out = "";
  let last = 0;
  let m;
  while ((m = open.exec(html))) {
    const end = matchEnd(html, m.index, tag);
    if (end < 0) continue;
    const block = html.slice(m.index, end);
    if (!pred(block)) continue;
    out += html.slice(last, m.index);
    last = end;
    open.lastIndex = end;
  }
  return out + html.slice(last);
}

/** Remove whole <section> blocks whose inner HTML contains one of `needles`. */
function removeSectionsContaining(html, needles) {
  const open = /<section\b[^>]*>/gi;
  let out = "";
  let last = 0;
  let m;
  while ((m = open.exec(html))) {
    const end = matchEnd(html, m.index, "section");
    if (end < 0) continue;
    const block = html.slice(m.index, end);
    const hit = needles.some((n) => block.includes(n));
    // only drop the section when it is not nested around the page's main content
    if (!hit || block.length > 14000) {
      continue;
    }
    out += html.slice(last, m.index);
    last = end;
    open.lastIndex = end;
  }
  return out + html.slice(last);
}


/** FAQ entries (question + answer) that talk about prices / quotes / ordering a build. */
const FAQ_DROP_RE =
  /₩\s?[\d,]|\$\s?[\d,]{3,}|예상 기간|estimated timeline|geschätzt\w* (?:zeitplan|dauer)|견적|시작가|의뢰|quote|estimate|starting (?:at|from|price)|from \$|presupuesto|orçamento|orcamento|devis|angebot|見積|उद्धरण|kutipan|harga mulai|preço|precio|prix|preis/i;

/** Plain-language replacements (text nodes + meta). Order matters: specific first. */
const TEXT_MAP = {
  en: [
    ["Quote inquiry →", "Inquire →"],
    ["QUOTE READY", "SCOPE READY"],
    ["Final quotes", "Final scope"],
    [/\bquoted\b/g, "scoped"],
    [/\bQuoted\b/g, "Scoped"],
    [/\bquoting\b/g, "scoping"],
    [/\bquotes\b/g, "scope"],
    [/\bQuotes\b/g, "Scope"],
    [/\bquote\b/g, "scope"],
    [/\bQuote\b/g, "Scope"],
    [/\boutsourc\w*/gi, "external development"],
  ],
  ko: [
    ["서비스 · 견적", "서비스 안내"],
    ["시작가에는 ", ""],
    ["시작가에 ", ""],
    ["의 시작가는 ", "는 "],
    ["의 시작가는", "는"],
    ["별도 견적·일정 협의", "별도 협의"],
    ["최종 견적이 달라질 수 있습니다", "최종 범위가 달라질 수 있습니다"],
    ["정확한 견적을 안내합니다", "자세한 내용을 안내합니다"],
    ["견적 문의", "문의"],
    ["별도 견적", "별도 협의"],
    ["견적에서 정합니다", "협의 단계에서 정합니다"],
    ["견적에서 정하는", "협의 단계에서 정하는"],
    ["견적 발송 전", "발송 전"],
    ["견적", "협의"],
    ["외주 개발", "외부 개발"],
    ["외주", "외부 개발"],
    ["납품", "제공"],
    ["제작 의뢰", "제작 문의"],
    ["의뢰", "문의"],
  ],
};

function mapText(html, lang) {
  const list = TEXT_MAP[lang];
  if (!list) return html;
  // keep <script> (except JSON-LD) and <style> untouched
  return html.replace(/(<script\b(?![^>]*ld\+json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)|([^<]+|<[^>]*>)/gi, (all, keep, other) => {
    if (keep) return keep;
    let x = other;
    for (const [a, b] of list) x = typeof a === "string" ? x.split(a).join(b) : x.replace(a, b);
    return x;
  });
}

/** Drop " · "-separated meta segments that carry a price / duration. */
function stripMetaPrice(html) {
  return html.replace(/((?:name|property)="(?:description|og:description|twitter:description)" content=")([^"]*)(")/g, (all, a, v, c) => {
    const nv = v
      .split(/\s·\s/)
      .filter((seg) => !/₩\s?[\d,]|시작가|starting (?:at|from)|\bfrom \$|^\d+[–-]\d+\s?(?:일|days?|weeks?|주)\b/i.test(seg))
      .join(" · ")
      .replace(/[\s·]+(?=\.?$)/, "");
    return a + nv + c;
  });
}

const PRICE_SENT_RE = /₩\s?[\d,.]+|시작가|예상 기간|\bstarting (?:at|from|prices?)\b|\bestimated (?:project )?timeline\b|\btimelines are estimates/i;

/** Remove sentences that state a price / starting price / duration from text nodes (not <option> / script / style). */
function dropPriceSentences(html) {
  let lastTag = "";
  return html.replace(/(<script\b[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)|(<[^>]*>)|([^<]+)/gi, (all, keep, tag, text) => {
    if (keep) return keep;
    if (tag) {
      lastTag = tag;
      return tag;
    }
    if (/^<(option|button|a|label|h\d|span|dt|dd|li|strong)\b/i.test(lastTag) === false || true) {
      if (/^<option\b/i.test(lastTag) || !PRICE_SENT_RE.test(text)) return text;
      const parts = text.split(/(?<=[.。!?])\s+/);
      const kept = parts.filter((x) => !PRICE_SENT_RE.test(x));
      return kept.join(" ");
    }
    return text;
  });
}

const txt = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

export function sanitizeBusinessHtml(html, lang = "ko") {
  let h = html;
  // 1) price / pricing / quote sections (whole section)
  h = removeSectionsContaining(h, ['class="bs-price', 'class="bp-pricing', 'class="bp-sec bp-pricing', "bs-collab-pricing", 'class="bp-quote', 'aria-labelledby="bs-dr-engage-title']);
  // 2) stray price blocks
  h = removeByClass(h, "div", "bp-explore__price");
  h = removeByClass(h, "div", "bs-price");
  h = removeByClass(h, "p", "bz-pkg__price");
  // 3) "label / value" rows: <div><dt>Label</dt><dd>…</dd></div>
  h = h.replace(/<div>\s*<dt>([^<]*)<\/dt>\s*<dd>[\s\S]*?<\/dd>\s*<\/div>\s*/g, (all, label) =>
    ROW_LABEL_RE.test(txt(label)) ? "" : all
  );
  // 4) service-summary meta rows
  h = removeByClass(h, "div", "bs-dr-meta__row", (block) => {
    const k = /class="bs-dr-meta__k">([^<]*)</.exec(block);
    return !!k && ROW_LABEL_RE.test(txt(k[1]));
  });
  // 4b) FAQ items about price / quote / ordering
  h = removeByClass(h, "div", "bs-faq-item", (block) => FAQ_DROP_RE.test(txt(block)));
  h = removeByClass(h, "div", "bp-faq__item", (block) => FAQ_DROP_RE.test(txt(block)));
  // 4c) price / duration fragments inside meta descriptions
  h = stripMetaPrice(h);
  // 5) CTA labels
  const map = CTA_MAP[lang] || {};
  for (const [from, to] of Object.entries(map)) {
    h = h.split(`>${from}<`).join(`>${to}<`);
  }
  h = mapText(h, lang);
  h = dropPriceSentences(h);
  h = h.replace(/<p class="[^"]*">\s*<\/p>\s*/g, "");
  return h;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === "index.html") out.push(p);
  }
  return out;
}

export function sanitizeTree(root = ROOT_DEFAULT, { check = false } = {}) {
  let changed = 0;
  for (const lang of LANGS) {
    for (const area of ["business", "studio"]) {
      for (const f of walk(path.join(root, lang, area))) {
        const before = fs.readFileSync(f, "utf8");
        if (before.length < 600 && /http-equiv="refresh"/i.test(before)) continue;
        const after = sanitizeBusinessHtml(before, lang);
        if (after !== before) {
          changed += 1;
          if (!check) fs.writeFileSync(f, after);
        }
      }
    }
  }
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const root = process.argv.slice(2).find((a) => !a.startsWith("--")) || ROOT_DEFAULT;
  const n = sanitizeTree(root, { check });
  console.log(`business-model-sanitize: ${check ? "would change" : "changed"} ${n} file(s)`);
  if (check && n) process.exitCode = 1;
}
