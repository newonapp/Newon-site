/**
 * Serve background films from newon.app instead of the external CDN, so they start immediately.
 *
 * assets/films/<name>.mp4 — web-optimised H.264 (≤1600px, no audio, faststart) of each CDN film
 * assets/films/<name>.jpg — its first frame, used as the <video poster> so a still shows at once
 *
 * Runs on the assembled _publish/ tree only (sources keep the original CDN URLs):
 *  1. every CDN film URL whose optimised copy exists is rewritten to /assets/films/<name>.mp4
 *  2. every <video> playing one of these films gets poster="/assets/films/<name>.jpg"
 *  3. the first film poster of a page is preloaded with high priority
 * Films without a local copy keep their CDN URL (nothing breaks).
 */
import fs from "node:fs";
import path from "node:path";

const CDN_RE = /https:\/\/d(?:8j0ntlcm91z4|2ol7oe51mr4n9)\.cloudfront\.net\/user_38xzZboKViGWJOttwIXH07lWA1P\/([A-Za-z0-9_-]+)\.mp4/g;
const TEXT_EXT = new Set([".html", ".js", ".mjs", ".css", ".json"]);

function walk(dir, out) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(path.extname(ent.name))) out.push(p);
  }
  return out;
}

function addPosters(html) {
  let first = null;
  // existing posters on the external CDN → the local first frame of the same film
  html = html.replace(/<video\b[^>]*>/g, (tag) => {
    const m = tag.match(/\s(?:src|data-og-src)="\/assets\/films\/([A-Za-z0-9_-]+)\.mp4"/);
    if (!m) return tag;
    return tag.replace(/\sposter="https:\/\/[^"]*cloudfront\.net[^"]*"/, ` poster="/assets/films/${m[1]}.jpg"`);
  });
  // lazily started films (data-og-src) still show their first frame at once
  html = html.replace(/<video\b([^>]*?)\sdata-og-src="\/assets\/films\/([A-Za-z0-9_-]+)\.mp4"([^>]*)>/g, (m, a, name, b) => {
    if (/\sposter=/.test(a + b)) return m;
    return `<video${a} data-og-src="/assets/films/${name}.mp4" poster="/assets/films/${name}.jpg"${b}>`;
  });
  // <video ... src="/assets/films/X.mp4" ...>
  html = html.replace(/<video\b([^>]*?)\ssrc="\/assets\/films\/([A-Za-z0-9_-]+)\.mp4"([^>]*)>/g, (m, a, name, b) => {
    first = first || name;
    if (/\sposter=/.test(a + b)) return m;
    return `<video${a} src="/assets/films/${name}.mp4" poster="/assets/films/${name}.jpg"${b}>`;
  });
  // <video ...> <source src="/assets/films/X.mp4"
  html = html.replace(/<video\b([^>]*)>(\s*(?:<source\b[^>]*>\s*)*?<source\b[^>]*\ssrc="\/assets\/films\/([A-Za-z0-9_-]+)\.mp4")/g, (m, a, rest, name) => {
    first = first || name;
    if (/\sposter=/.test(a)) return m;
    return `<video${a} poster="/assets/films/${name}.jpg">${rest}`;
  });
  if (first && !html.includes(`rel="preload" href="/assets/films/${first}.jpg"`)) {
    html = html.replace(/<\/head>/i, `<link rel="preload" href="/assets/films/${first}.jpg" as="image" fetchpriority="high" />\n</head>`);
  }
  return html;
}

export function localizeFilms(outDir) {
  const filmsDir = path.join(outDir, "assets", "films");
  if (!fs.existsSync(filmsDir)) return { files: 0, urls: 0, posters: 0 };
  const have = new Set(
    fs.readdirSync(filmsDir)
      .filter((f) => f.endsWith(".mp4") && fs.existsSync(path.join(filmsDir, f.replace(/\.mp4$/, ".jpg"))))
      .map((f) => f.replace(/\.mp4$/, "")),
  );
  let files = 0;
  let urls = 0;
  let posters = 0;
  for (const file of walk(outDir, [])) {
    if (file.startsWith(filmsDir)) continue;
    const src = fs.readFileSync(file, "utf8");
    if (!src.includes("cloudfront.net")) continue;
    let n = 0;
    let txt = src.replace(CDN_RE, (m, name) => {
      if (!have.has(name)) return m;
      n += 1;
      return `/assets/films/${name}.mp4`;
    });
    if (!n) continue;
    if (file.endsWith(".html")) {
      const before = (txt.match(/poster="\/assets\/films\//g) || []).length;
      txt = addPosters(txt);
      posters += (txt.match(/poster="\/assets\/films\//g) || []).length - before;
    }
    fs.writeFileSync(file, txt, "utf8");
    files += 1;
    urls += n;
  }
  return { files, urls, posters };
}
