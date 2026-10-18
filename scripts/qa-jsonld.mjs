#!/usr/bin/env node
/**
 * JSON-LD regression check: every <script type="application/ld+json"> block in the 9 language trees must parse.
 * (6be1475 shipped 8 unparseable blocks: the sanitizer cut closing quotes. P6 keeps that from coming back.)
 *   node scripts/qa-jsonld.mjs [--json out.json]     exit 0 = PASS, 1 = FAIL
 * Also reports how many blocks are @type Service and which Service descriptions still match outsourcing wording
 * (information only, never a failure: the two hub pages carry a negated sentence on purpose).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LANGS = ["ko", "en", "ja", "es", "pt-br", "fr", "de", "hi", "id"];
const OUTSOURCING = /white[- ]?label|outsourc|custom (product|develop)|맞춤 제품|화이트라벨|외주|設計し構築|we design and build|구현합니다|설계하고/i;
const bad = [], wording = [];
let blocks = 0, service = 0, pages = 0;
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === "index.html") {
      pages += 1;
      const h = fs.readFileSync(p, "utf8");
      for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        blocks += 1;
        try {
          const j = JSON.parse(m[1]);
          for (const o of Array.isArray(j) ? j : j["@graph"] || [j]) {
            if (o["@type"] === "Service") {
              service += 1;
              if (OUTSOURCING.test(o.description || "")) wording.push(`${path.relative(ROOT, p)}: ${(o.description || "").slice(0, 80)}`);
            }
          }
        } catch (err) { bad.push(`${path.relative(ROOT, p)}: ${err.message}`); }
      }
    }
  }
};
for (const l of LANGS) if (fs.existsSync(path.join(ROOT, l))) walk(path.join(ROOT, l));
const jo = process.argv.indexOf("--json");
if (jo > 0) fs.writeFileSync(process.argv[jo + 1], `${JSON.stringify({ pages, blocks, service, unparseable: bad, serviceDescriptionsMatchingOutsourcingTerms: wording }, null, 1)}\n`);
for (const b of bad.slice(0, 20)) console.error(`jsonld: UNPARSEABLE ${b}`);
console.log(`jsonld: ${bad.length ? "FAIL" : "PASS"} · ${pages} pages, ${blocks} blocks, ${service} Service, unparseable ${bad.length}; Service descriptions with outsourcing wording ${wording.length} (info)`);
process.exit(bad.length ? 1 : 0);
