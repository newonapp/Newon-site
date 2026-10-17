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
  ja: { "見積依頼 →": "お問い合わせ →", "見積もりを依頼 →": "お問い合わせ →", "Production inquiry →": "お問い合わせ →" },
  es: { "Solicitar presupuesto →": "Consultar →", "Solicita un presupuesto →": "Consultar →", "Production inquiry →": "Consultar →" },
  "pt-br": { "Solicitar um orçamento →": "Entrar em contato →", "Solicite um orçamento →": "Entrar em contato →", "Production inquiry →": "Entrar em contato →" },
  fr: { "Demander un devis →": "Nous contacter →", "Production inquiry →": "Nous contacter →" },
  de: { "Fordern Sie ein Angebot an": "Anfrage senden", "Angebot anfordern →": "Anfrage senden →", "Production inquiry →": "Anfrage senden" },
  hi: { "एक उद्धरण का अनुरोध करें →": "पूछताछ करें →", "Production inquiry →": "पूछताछ करें →" },
  id: { "Meminta kutipan →": "Ajukan pertanyaan →", "Minta penawaran →": "Ajukan pertanyaan →", "Production inquiry →": "Ajukan pertanyaan →" },
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
  /₩\s?[\d,]|\$\s?[\d,]{3,}|예상 기간|estimated timeline|geschätzt\w* (?:zeitplan|dauer)|견적|시작가|의뢰|\bquot|\bestimate|starting (?:at|from|price)|from \$|presupuesto|cotizaci|orçamento|orcamento|cotação|devis|devisé|Kostenvoranschlag|Angebot (?:anfordern|abgeben)|ein Angebot|Angebotserstellung|見積|उद्धरण|कोटेशन|kutipan|penawaran harga|harga mulai|preço|precio|prix|preis/i;

/** Words that describe an offer / quote / outsourced order (per language). A sentence containing one is dropped unless a rewrite rule handled it first. */
const QUOTE_RE = {
  ko: /견적|외주|납품|의뢰|용역|수주/,
  en: /\bquot\w*|\bestimate\b|outsourc\w*|\bcommission(?:ed)?\b/i,
  ja: /見積|外注|受注|制作依頼|開発代行/,
  es: /presupuesto|cotizaci|subcontrat|externaliz/i,
  "pt-br": /orçamento|cotação|terceiriz/i,
  fr: /devis|sous-traitan|externalis/i,
  de: /Kostenvoranschlag|Angebot (?:anfordern|abgeben)|ein Angebot|Angebotserstellung|Auslagerung|Outsourcing|angeboten/i,
  hi: /उद्धरण|कोटेशन|आउटसोर्स/,
  id: /kutipan|penawaran harga|alih daya|outsourc/i,
};

/** Meaning-preserving rewrites applied BEFORE any drop. [pattern, replacement] — regexes only. */
const REWRITE = {
  ko: [
    [/정확한 최종 견적이 아니라/g, "확정된 금액이 아니라"],
    [/견적 문의/g, "문의"],
    [/서비스 · 견적/g, "서비스 안내"],
    [/견적 안내/g, "문의 안내"],
    [/견적 발송 전/g, "발송 전"],
    [/(?:맞춤|별도) 견적(?:·일정 협의)?/g, "별도 협의"],
    [/추가 견적/g, "추가 협의"],
    [/프로젝트별 견적/g, "프로젝트별 협의"],
    [/견적 단계/g, "협의 단계"],
    [/견적(?:에서|에)\s*(정합니다|정하는|확정합니다|확정)/g, "협의 단계에서 $1"],
    [/(?:일정|범위)·견적/g, "$&"],
    [/새 외주를/g, "새 외부 업체를"],
    [/외주 개발/g, "외부 개발"],
    [/납품/g, "제공"],
    [/제작 의뢰/g, "제작 문의"],
    [/의뢰/g, "문의"],
    [/\bQuote\b/g, "Terms"],
  ],
  en: [
    [/Request a quote →/g, "Inquire →"],
    [/Quote inquiry →/g, "Inquire →"],
    [/QUOTE READY/g, "NEXT STEP"],
    [/Quote, schedule, and what is excluded/g, "Schedule and what is excluded"],
    [/In scope vs extra quote/g, "In scope vs extra"],
    [/Features set in the quote/g, "Features set during discussion"],
    [/Agree scope, timing and quote/g, "Agree scope and timing"],
    [/Manager approval before sending a quote/g, "Manager approval before sending"],
    [/Scope and price are (?:custom quotes?|quoted after a consultation)/g, "Scope and terms are discussed individually"],
    [/(?:Custom|custom) quotes? and timeline/g, "Discussed individually"],
    [/(?:Custom|custom) quotes?\b/g, "Discussed individually"],
    [/Quoted per project/g, "Discussed per project"],
    [/Quoted as a separate project\./g, "Discussed as a separate project."],
    [/\b(?:is|are) quoted separately/g, "are discussed separately"],
    [/quoted separately/g, "discussed separately"],
    [/quoted via/g, "discussed via"],
    [/Large features: extra quote/g, "Large features: discussed separately"],
    [/Work beyond the contract, including renewal: extra quote/g, "Work beyond the contract, including renewal: discussed separately"],
    [/Build fee: quoted after features and integrations/g, "Build: discussed after features and integrations"],
    [/Whether it is included is set in the quote\./g, "Whether it is included is set during discussion."],
    [/Set in the quote\./g, "Set during discussion."],
    [/(?:confirmed|set in advance|set) (?:in scope and )?at quoting/g, (m) => m.replace(/quoting/, "scoping")],
    [/confirmed in scope and quoting/g, "confirmed in scope discussion"],
    [/at quoting/g, "at scoping"],
    [/B2B landing centered on inquiry or quote\./g, "B2B landing centered on inquiry."],
    [/Material for dev quote and timeline\./g, "Material for development discussion."],
    [/Propose scope, timeline, and quote next\./g, "Propose scope and timeline next."],
    [/Work: only the partial edits and features listed in the quote/g, "Work: only the partial edits and features agreed"],
    [/Confirm what can be changed, then set the quote and schedule\./g, "Confirm what can be changed, then set the schedule."],
    [/Quote after the current site and renewal range are reviewed/g, "Discussed after the current site and renewal range are reviewed"],
    [/\boutsourc(?:e|ing|ed|ers?)\b/gi, "external development"],
  ],
};

const JOSA_FIX = [
  [/협의이/g, "협의가"],
  [/협의은/g, "협의는"],
  [/협의을/g, "협의를"],
  [/협의으로/g, "협의로"],
  [/협의과/g, "협의와"],
];

const PRICE_SENT_RE = /₩\s?[\d,.]+|시작가|예상 기간|\bstarting (?:at|from|prices?)\b|\bestimated (?:project )?timeline\b|\btimelines are estimates/i;

function splitSentences(text) {
  return text.split(/(?<=[.。!?])\s+|\n+/);
}

/** One text value (a text node or an attribute value): rewrite, then drop price / quote sentences. Returns "" when nothing is left. */
export function processText(text, lang) {
  if (!text || !text.trim()) return text;
  let x = text;
  for (const [re, rep] of REWRITE[lang] || []) x = x.replace(re, rep);
  if (lang === "ko") for (const [re, rep] of JOSA_FIX) x = x.replace(re, rep);
  const quote = QUOTE_RE[lang];
  const bad = (s) => PRICE_SENT_RE.test(s) || (quote && quote.test(s));
  if (!bad(x)) return x;
  const lead = /^\s*/.exec(x)[0];
  const trail = /\s*$/.exec(x)[0];
  const parts = splitSentences(x.trim()).filter((s) => s && !bad(s));
  return parts.length ? lead + parts.join(" ") + trail : "";
}

/** Apply processText to every text node, and to description-like attributes / JSON-LD descriptions. */
function processAllText(html, lang) {
  const out = html.replace(/(<script\b(?![^>]*ld\+json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)|(<[^>]*>)|([^<]+)/gi, (all, keep, tag, text) => {
    if (keep) return keep;
    if (tag) {
      return tag.replace(/((?:name|property)="(?:description|og:description|twitter:description)" content=")([^"]*)(")/g, (m, a, v, c) => {
        const raw = v.replace(/&amp;/g, "&");
        const nv = processText(raw.split(/\s·\s/).filter((seg) => !PRICE_SENT_RE.test(seg)).join(" · "), lang);
        return a + nv.replace(/&/g, "&amp;").replace(/[\s·]+$/, "") + c;
      });
    }
    return processText(text, lang);
  });
  return out;
}

/** Drop elements whose text became empty after text processing. */
function dropEmptyElements(html) {
  let h = html;
  for (let i = 0; i < 3; i += 1) {
    h = h.replace(/<(h[1-6]|p|li|dt|dd|summary)(\s[^>]*)?>\s*<\/\1>\s*/gi, "");
    h = h.replace(/<div class="[^"]*">\s*<\/div>\s*/g, (m) => (/(bs-faq-a|bp-faq__a|bs-dr-meta__row|bp-explore__foot)/.test(m) ? m : m));
  }
  return h;
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
  // 5) CTA labels
  const map = CTA_MAP[lang] || {};
  for (const [from, to] of Object.entries(map)) {
    h = h.split(`>${from}<`).join(`>${to}<`);
  }
  h = processAllText(h, lang);
  h = dropEmptyElements(h);
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
