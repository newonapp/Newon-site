#!/usr/bin/env node
/**
 * Locate wording that can read as outsourcing / contract production / a delivered vendor product on the Business
 * capability pages, in all 9 languages (read-only; never edits a page, never decides the wording).
 *   node scripts/qa-business-wording-scan.mjs [--json out.json]
 * A hit is a LOCATION to review against the confirmed ko/en partnership wording, not a verdict: the confirmed ko/en
 * text itself is included so the owner sees what the confirmed pages still say.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const jsonOut = argv.includes("--json") ? argv[argv.indexOf("--json") + 1] : null;
const PAGES = ["business/build", "business/solutions", "business/care", "business/white-label", "business/custom-product", "business/internal-system", "business/product-launch"];
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
/** term families: [family, regex source]. Families are shared across languages so counts compare. */
const TERMS = {
  "white-label": "white[- ]?label|화이트라벨|ホワイトラベル|marca blanca|marque blanche|weiß?e?s? ?label|white-label|merek putih|मार्का|व्हाइट[- ]?लेबल|marca branca",
  "custom-made": "custom (product|digital|software|development)|맞춤(형)?|カスタム|a medida|sob medida|sur mesure|maßgeschneidert|kundenspezifisch|khusus|कस्टम|अनुकूलित",
  "delivery-to-client": "납품|인수인계|handoff|hand-off|deliver(y|ables)?|entrega|livraison|lieferung|bereitstellen|納品|引き渡し|pengiriman|serah terima|हैंडऑफ़|डिलीवर",
  "commission/outsourcing": "외주|수탁|의뢰|outsourc|commission|encargo|encomenda|commande|auftrag|aufträge|受託|委託|依頼|pesanan|kontrak|कमीशन|ठेके",
  "quote/price menu": "견적|가격 안내|pricing|quote|presupuesto|orçamento|devis|angebot|見積|penawaran|कोटेशन|मूल्य",
  "contract": "계약|contract|contrato|contrat|vertrag|契約|kontrak|अनुबंध",
};
const re = Object.fromEntries(Object.entries(TERMS).map(([k, v]) => [k, new RegExp(v, "i")]));
function lines(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0].replace(/<(script|style|svg)[\s\S]*?<\/\1>/gi, " ");
  return main.replace(/<\/(p|h[1-6]|li|a|button|summary|dt|dd|td|th|div|section)>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.length >= 6);
}
const out = { terms: Object.keys(TERMS), pages: {} };
for (const page of PAGES) for (const lang of LANGS) {
  const f = path.join(ROOT, lang, page, "index.html");
  if (!fs.existsSync(f)) continue;
  const hits = [];
  for (const l of new Set(lines(fs.readFileSync(f, "utf8")))) {
    const fam = Object.keys(re).filter((k) => re[k].test(l));
    if (fam.length) hits.push({ families: fam, text: l.slice(0, 220) });
  }
  out.pages[`${lang}/${page}`] = hits;
}
if (jsonOut) fs.writeFileSync(jsonOut, `${JSON.stringify(out, null, 1)}\n`);
const total = (lang) => Object.entries(out.pages).filter(([k]) => k.startsWith(`${lang}/`)).reduce((a, [, h]) => a + h.length, 0);
console.log(`business-wording-scan: ${Object.keys(out.pages).length} pages · lines to review by language: ${LANGS.map((l) => `${l} ${total(l)}`).join(" · ")}`);
