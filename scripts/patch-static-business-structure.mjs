#!/usr/bin/env node
/**
 * One-off, idempotent patch for committed static pages that the normal build does not
 * re-render (e.g. /{lang}/ecosystem/, some news pages): aligns their links with the
 * six-business structure without re-rendering (so their markup/CSS stay untouched).
 *   - /{lang}/lifestage/ links → /{lang}/livon/ (see newon-business-units.mjs)
 *   - footer "Apps" link → apps/ (same as site-chrome FOOTER_MENUS)
 *   - former business-news titles (Consumer / Commerce) → current titles (news-data.mjs)
 *
 *   node scripts/patch-static-business-structure.mjs
 */
import fs from "fs";
import path from "path";
import { LANGS, ROOT } from "./hub-utils.mjs";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === "lifestage" || name === "play") continue; // redirect stubs / Flutter build
      walk(p, out);
    } else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

/** Old → new news titles, as they appear in static pagers / "more news" rows. */
const TEXT_REPLACEMENTS = [
  ["Newon Commerce, 일상과 연결되는 커머스·생활서비스 사업 확대 구상", "Newon Apps, 일상과 연결되는 커머스·생활서비스 확장 구상"],
  ["Newon Consumer, 일상을 위한 모바일 앱 생태계 확장", "Newon Apps, 일상을 위한 모바일 앱 생태계 확장"],
  ["Newon Commerce is shaping commerce and everyday services connected to daily life", "Newon Apps is exploring commerce and everyday services connected to daily life"],
  ["Newon Consumer extends the mobile apps for everyday life", "Newon Apps extends the mobile apps for everyday life"],
];

let changed = 0;
for (const { dir } of LANGS) {
  for (const file of walk(path.join(ROOT, dir))) {
    const before = fs.readFileSync(file, "utf8");
    let html = before
      .replace(/href="((?:\.\.\/)+)lifestage\/([^"]*)"/g, 'href="$1livon/$2"')
      .replace(/href="\/(ko|en|ja|es|pt-br|fr|de|hi|id)\/lifestage\/([^"]*)"/g, 'href="/$1/livon/$2"')
      .replace(
        /(<nav class="site-foot__nav"[^>]*><a href="(?:\.\.\/)*)products\/">/g,
        '$1apps/">'
      );
    for (const [from, to] of TEXT_REPLACEMENTS) html = html.split(from).join(to);
    if (html !== before) {
      fs.writeFileSync(file, html);
      changed++;
    }
  }
}
console.log(`patch-static-business-structure: ${changed} file(s) updated`);
