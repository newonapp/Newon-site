#!/usr/bin/env node
/**
 * LIVON performance quality check — deterministic, no browser, no dependency.
 *
 *   node scripts/livon-performance-quality.mjs                  sources only (livon/index.html, its JS/CSS, images)
 *   node scripts/livon-performance-quality.mjs --root _publish   also the generated output under <root>/livon/
 *
 * What it checks (things a file can prove):
 *   loading      page styles are in the head · every background video waits for its screen (data-src, preload="none") ·
 *                the loader and the start-up scheduler are present and come before the page modules ·
 *                third-party scripts do not block parsing · no script is loaded twice · requested web fonts are used
 *   budgets      number and size of scripts and style sheets, size of the app page, size of every image
 *   images       dimensions or lazy loading on every <img>, in the page and in the JS templates
 *   start-up     every screen module registers with the start-up scheduler
 *   leakage      the public app does not load Admin files · static SEO pages load no app script and stay small
 *   output       no source maps, no byte-identical duplicate JS/CSS under livon/
 *
 * What it cannot check: how fast anything is. Timings (LCP, CLS, blocking time, interaction latency) come from the
 * browser measurements described in docs/livon/LIVON_PERFORMANCE.md — this script never reports a speed.
 *
 * Budgets are set a little above the measured state of this build, so they catch growth, not today's numbers.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const KB = 1024;

export const BUDGET = {
  appScripts: 60,            /* local <script src> on the app page (56 measured) */
  appScriptBytes: 1850 * KB, /* their total, uncompressed (1,654 KB measured) */
  scriptBytes: 160 * KB,     /* one script (135 KB measured: life-now-page.js) */
  appStyles: 18,             /* local style sheets (17 measured) */
  appStyleBytes: 700 * KB,   /* their total (637 KB measured) */
  styleBytes: 120 * KB,      /* one style sheet (104 KB measured: styles.css) */
  appPageBytes: 240 * KB,    /* livon/index.html (215 KB measured) */
  inlineStyleBytes: 48 * KB, /* the page's own <style> (38 KB measured) */
  imageBytes: 600 * KB,      /* one image under livon/assets (530 KB measured) */
  topicImagesBytes: 10 * KB * KB, /* all topic photos (9.1 MB measured, 13.5 MB before) */
  logoBytes: 20 * KB,        /* the header logo (8.5 KB measured, 189 KB before) */
  staticPageBytes: 40 * KB,  /* one generated static page (10–24 KB measured) */
  staticCssBytes: 12 * KB,   /* livon/seo.css (6.7 KB measured) */
  adminScripts: 24,          /* scripts on an Admin / Data Manager page */
};

/* screens whose module starts on demand (livon/livon-boot.js) */
export const SCREEN_MODULES = {
  'home-page.js': 'home', 'life-page.js': 'life', 'today-feed.js': 'today', 'today-page.js': 'today',
  'life-now-page.js': 'life-now', 'explore-page.js': 'explore', 'community-page.js': 'community', 'ai-page.js': 'livon-ai',
};

const size = f => statSync(f).size;
const kb = n => (n / KB).toFixed(1) + ' KB';
const local = (repo, url) => join(repo, url.split('?')[0].replace(/^\//, ''));
function walk(dir, test, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, test, out); else if (test(p)) out.push(p);
  }
  return out;
}
const attr = (tag, name) => { const m = new RegExp('\\s' + name + '\\s*=\\s*"([^"]*)"').exec(tag); return m ? m[1] : (new RegExp('\\s' + name + '(?=[\\s/>])').test(tag) ? '' : null); };

export function scriptsOf(html) { return [...html.matchAll(/<script\b[^>]*\bsrc="[^"]+"[^>]*>/g)].map(m => ({ tag: m[0], src: attr(m[0], 'src'), index: m.index })); }
export function stylesOf(html) { return [...html.matchAll(/<link\b[^>]*>/g)].map(m => m[0]).filter(t => attr(t, 'rel') === 'stylesheet').map(t => attr(t, 'href')); }

/* loading rules of the app page — everything the HTML text alone can prove */
export function checkAppHtml(html) {
  const errors = [], warnings = [], stats = {};
  const headEnd = html.indexOf('</head>');
  for (const m of html.matchAll(/<style\b/g)) if (m.index > headEnd) errors.push('[livon/index.html] a <style> block sits outside <head> (screens are painted before it applies)');
  const inline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].reduce((n, m) => n + Buffer.byteLength(m[1]), 0);
  if (inline > BUDGET.inlineStyleBytes) errors.push(`[budget] inline <style> ${kb(inline)} > ${kb(BUDGET.inlineStyleBytes)}`);

  const videos = [...html.matchAll(/<video\b[^>]*>/g)].map(m => m[0]);
  for (const v of videos) {
    const id = (attr(v, 'class') || '').split(' ')[0] || 'video';
    if (attr(v, 'src') != null) errors.push(`[video] ${id}: has src (every screen's film would be fetched on every visit) — use data-src`);
    if (!attr(v, 'data-src')) errors.push(`[video] ${id}: no data-src`);
    if (attr(v, 'preload') !== 'none') errors.push(`[video] ${id}: preload is not "none"`);
  }
  if (/<source\b[^>]*\bsrc=/.test(html)) errors.push('[video] a <source src> is fetched as soon as the page is parsed — use data-src on the <video>');
  stats.backgroundVideos = videos.length;

  const scripts = scriptsOf(html), srcs = scripts.map(s => s.src.split('?')[0]);
  const pos = name => srcs.indexOf(name);
  for (const need of ['/livon/livon-media.js', '/livon/livon-boot.js']) if (pos(need) < 0) errors.push(`[livon/index.html] ${need} is not loaded`);
  const firstModule = Math.min(...Object.keys(SCREEN_MODULES).map(f => pos('/livon/' + f)).filter(i => i >= 0));
  if (pos('/livon/livon-boot.js') > firstModule) errors.push('[livon/index.html] livon-boot.js must come before the screen modules');
  if (pos('/livon/livon-media.js') > firstModule) errors.push('[livon/index.html] livon-media.js must come before the screen modules');
  const router = html.indexOf('function showLivonScreen');
  const boot = scripts.find(s => s.src.split('?')[0] === '/livon/livon-boot.js');
  if (router < 0) errors.push('[livon/index.html] the inline router was not found');
  if (boot && router >= 0 && boot.index > router) errors.push('[livon/index.html] livon-boot.js must come before the inline router (its hashchange listener has to run first)');
  for (const s of scripts) if (/^https?:/.test(s.src) && attr(s.tag, 'async') == null && attr(s.tag, 'defer') == null) errors.push(`[script] third-party script blocks parsing: ${s.src}`);
  const dup = srcs.filter((s, i) => srcs.indexOf(s) !== i);
  if (dup.length) errors.push('[script] loaded twice: ' + [...new Set(dup)].join(', '));
  for (const s of scripts) if (!/^https?:/.test(s.src) && s.index < headEnd && attr(s.tag, 'async') == null && attr(s.tag, 'defer') == null && !/newon-auth-config|livon-api-config|site-lang/.test(s.src)) warnings.push(`[script] parser-blocking script in <head>: ${s.src}`);

  return { errors, warnings, stats, scripts, srcs };
}

export function checkSources(repo = REPO) {
  const read = f => readFileSync(join(repo, f), 'utf8');
  const html = read('livon/index.html');
  const { errors, warnings, stats, srcs } = checkAppHtml(html);

  /* ---- media loader and scheduler contracts ---- */
  const media = read('livon/livon-media.js'), bootJs = read('livon/livon-boot.js');
  if (!/FAIL_LIMIT\s*=\s*[1-3]\b/.test(media)) errors.push('[livon-media.js] no small retry limit for a video that cannot be loaded');
  if (/setInterval\s*\(/.test(media)) errors.push('[livon-media.js] must not poll');
  if (!/IntersectionObserver/.test(media)) errors.push('[livon-media.js] in-page films are not tied to the viewport');
  if (!/requestIdleCallback/.test(bootJs)) errors.push('[livon-boot.js] warm-up must run in idle time');
  for (const [file, view] of Object.entries(SCREEN_MODULES)) {
    const js = read('livon/' + file);
    if (!new RegExp('LivonBoot\\.view\\("' + view + '"').test(js)) errors.push(`[start-up] livon/${file} does not register with LivonBoot.view("${view}", …)`);
  }

  /* ---- fonts: every requested family is used somewhere ---- */
  const livonCss = readdirSync(join(repo, 'livon')).filter(f => f.endsWith('.css')).map(f => 'livon/' + f);
  const sheetFiles = stylesOf(html).filter(h => !/^https?:/.test(h)).map(h => h.split('?')[0].replace(/^\//, ''));
  const cssText = [...new Set([...livonCss, ...sheetFiles])].filter(f => existsSync(join(repo, f))).map(read).join('\n') + html;
  const families = [];
  for (const h of stylesOf(html).filter(h => /fonts\.googleapis\.com/.test(h))) for (const m of h.matchAll(/family=([^:&]+)/g)) families.push(decodeURIComponent(m[1]).replace(/\+/g, ' '));
  for (const fam of families) if (!new RegExp('font-family:[^;}]*' + fam.replace(/ /g, '\\s'), 'i').test(cssText) && !new RegExp('["\']' + fam + '["\']').test(cssText)) errors.push(`[font] "${fam}" is requested but no style uses it`);
  if (/Material\+Symbols/.test(html)) errors.push('[font] the Material Symbols icon font is requested (several hundred KB) but the app draws its icons itself');
  stats.webFontFamilies = families.length;

  /* ---- budgets ---- */
  const localScripts = srcs.filter(s => !/^https?:/.test(s)).map(s => local(repo, s)).filter(existsSync);
  const jsBytes = localScripts.reduce((n, f) => n + size(f), 0);
  stats.appScripts = localScripts.length; stats.appScriptKB = Math.round(jsBytes / KB);
  if (localScripts.length > BUDGET.appScripts) errors.push(`[budget] ${localScripts.length} scripts on the app page > ${BUDGET.appScripts}`);
  if (jsBytes > BUDGET.appScriptBytes) errors.push(`[budget] app scripts ${kb(jsBytes)} > ${kb(BUDGET.appScriptBytes)}`);
  for (const f of localScripts) if (size(f) > BUDGET.scriptBytes) errors.push(`[budget] ${relative(repo, f)} ${kb(size(f))} > ${kb(BUDGET.scriptBytes)}`);
  const localStyles = sheetFiles.map(f => join(repo, f)).filter(existsSync);
  const cssBytes = localStyles.reduce((n, f) => n + size(f), 0);
  stats.appStyles = localStyles.length; stats.appStyleKB = Math.round(cssBytes / KB);
  if (localStyles.length > BUDGET.appStyles) errors.push(`[budget] ${localStyles.length} style sheets on the app page > ${BUDGET.appStyles}`);
  if (cssBytes > BUDGET.appStyleBytes) errors.push(`[budget] app style sheets ${kb(cssBytes)} > ${kb(BUDGET.appStyleBytes)}`);
  for (const f of localStyles) if (size(f) > BUDGET.styleBytes) errors.push(`[budget] ${relative(repo, f)} ${kb(size(f))} > ${kb(BUDGET.styleBytes)}`);
  const pageBytes = Buffer.byteLength(html);
  stats.appPageKB = Math.round(pageBytes / KB);
  if (pageBytes > BUDGET.appPageBytes) errors.push(`[budget] livon/index.html ${kb(pageBytes)} > ${kb(BUDGET.appPageBytes)}`);

  /* ---- images ---- */
  const images = walk(join(repo, 'livon', 'assets'), f => /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(f));
  let topicBytes = 0;
  for (const f of images) {
    if (size(f) > BUDGET.imageBytes) errors.push(`[budget] ${relative(repo, f)} ${kb(size(f))} > ${kb(BUDGET.imageBytes)}`);
    if (/assets[\\/]topics[\\/]/.test(f)) topicBytes += size(f);
  }
  stats.images = images.length; stats.topicImagesKB = Math.round(topicBytes / KB);
  if (topicBytes > BUDGET.topicImagesBytes) errors.push(`[budget] topic photos ${kb(topicBytes)} > ${kb(BUDGET.topicImagesBytes)}`);
  const logo = /<img\b[^>]*class="[^"]*gnav__logo[^"]*"[^>]*>|<a\b[^>]*gnav__brand[^>]*>\s*<img\b[^>]*>/.exec(html);
  const logoSrc = logo ? attr(logo[0].slice(logo[0].lastIndexOf('<img')), 'src') : null;
  if (logoSrc && existsSync(local(repo, logoSrc)) && size(local(repo, logoSrc)) > BUDGET.logoBytes) errors.push(`[budget] header logo ${logoSrc} ${kb(size(local(repo, logoSrc)))} > ${kb(BUDGET.logoBytes)}`);
  const pageImgs = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  for (const t of pageImgs) {
    const dims = attr(t, 'width') != null && attr(t, 'height') != null;
    if (!dims && attr(t, 'loading') !== 'lazy') errors.push(`[image] no dimensions and not lazy: ${attr(t, 'src')}`);
    else if (!dims) warnings.push(`[image] no width/height (space is reserved by CSS only): ${attr(t, 'src')}`);
    const f = attr(t, 'src') && !/^https?:|^data:/.test(attr(t, 'src')) ? local(repo, attr(t, 'src')) : null;
    if (f && !existsSync(f)) errors.push(`[image] missing file: ${attr(t, 'src')}`);
  }
  let templates = 0, eager = 0;
  for (const f of readdirSync(join(repo, 'livon')).filter(f => f.endsWith('.js'))) {
    const js = read('livon/' + f);
    for (const m of js.matchAll(/<img\b[^>]{0,400}?\/?>/g)) {
      templates++;
      const t = m[0].replace(/\\"/g, '"');
      if (!/loading="lazy"/.test(t) && !/decoding="async"/.test(t)) { eager++; warnings.push(`[image] livon/${f}: template image is neither lazy nor decoded off the main thread`); }
    }
    for (const m of js.matchAll(/<video\b[^>]{0,400}?>/g)) {
      const t = m[0].replace(/\\"/g, '"');
      if (/\ssrc=/.test(t) && !/preload="none"/.test(t)) errors.push(`[video] livon/${f}: a card video is fetched as soon as it is rendered (use data-src + preload="none")`);
    }
    if (/sourceMappingURL=/.test(js)) errors.push(`[output] livon/${f} references a source map`);
  }
  stats.pageImages = pageImgs.length; stats.templateImages = templates;

  /* ---- leakage ---- */
  for (const s of srcs) if (/\/livon\/admin\//.test(s)) errors.push(`[leak] the public app loads an Admin file: ${s}`);
  for (const page of ['livon/admin/index.html', 'livon/admin/data/index.html']) {
    if (!existsSync(join(repo, page))) continue;
    const a = read(page), n = scriptsOf(a).length;
    if (n > BUDGET.adminScripts) errors.push(`[budget] ${page}: ${n} scripts > ${BUDGET.adminScripts}`);
    for (const s of scriptsOf(a)) if (Object.keys(SCREEN_MODULES).some(f => s.src.split('?')[0] === '/livon/' + f)) errors.push(`[leak] ${page} loads a public screen module: ${s.src}`);
    if (/<video\b/.test(a)) errors.push(`[leak] ${page} has a video`);
  }

  /* ---- byte-identical JS/CSS under livon/ ---- */
  const seen = new Map();
  for (const f of walk(join(repo, 'livon'), p => /\.(js|css)$/.test(p))) {
    const h = createHash('sha1').update(readFileSync(f)).digest('hex');
    if (seen.has(h)) warnings.push(`[duplicate] ${relative(repo, f)} is identical to ${relative(repo, seen.get(h))}`); else seen.set(h, f);
  }
  return { errors, warnings, stats };
}

export function checkPublished(root) {
  const errors = [], stats = { staticPages: 0, staticPageMaxKB: 0 };
  const dir = join(root, 'livon');
  if (!existsSync(dir)) return { errors: [`${dir} does not exist`], stats };
  for (const f of walk(dir, p => p.endsWith('.html'))) {
    const rel = relative(root, f);
    if (rel === join('livon', 'index.html') || rel.startsWith(join('livon', 'admin'))) continue;
    const html = readFileSync(f, 'utf8');
    if (/http-equiv="refresh"/i.test(html)) continue;   /* redirect stubs */
    stats.staticPages++;
    const bytes = Buffer.byteLength(html);
    stats.staticPageMaxKB = Math.max(stats.staticPageMaxKB, Math.round(bytes / KB));
    if (bytes > BUDGET.staticPageBytes) errors.push(`[budget] ${rel} ${kb(bytes)} > ${kb(BUDGET.staticPageBytes)}`);
    if (/<script\b(?![^>]*type="application\/ld\+json")/.test(html)) errors.push(`[leak] ${rel}: a static page loads a script`);
    if (/<video\b/.test(html)) errors.push(`[leak] ${rel}: a static page has a video`);
    const sheets = stylesOf(html).filter(h => !/^https?:/.test(h)).map(h => h.split('?')[0]);
    for (const s of sheets) if (s !== '/livon/seo.css') errors.push(`[leak] ${rel}: loads ${s} (static pages use seo.css only)`);
  }
  const seo = join(dir, 'seo.css');
  if (existsSync(seo) && size(seo) > BUDGET.staticCssBytes) errors.push(`[budget] livon/seo.css ${kb(size(seo))} > ${kb(BUDGET.staticCssBytes)}`);
  const maps = walk(dir, p => p.endsWith('.map'));
  if (maps.length) errors.push(`[output] ${maps.length} source map file(s) under livon/: ${relative(root, maps[0])}`);
  for (const need of ['livon/livon-media.js', 'livon/livon-boot.js', 'assets/livon-mark-icon-120.jpg']) if (!existsSync(join(root, need))) errors.push(`[output] ${need} is missing from the build`);
  return { errors, stats };
}

function main() {
  const args = process.argv.slice(2);
  const ri = args.indexOf('--root');
  const res = checkSources(REPO);
  if (ri >= 0) { const pub = checkPublished(resolve(process.cwd(), args[ri + 1])); pub.errors.forEach(e => res.errors.push(e)); Object.assign(res.stats, pub.stats); }
  if (args.includes('--verbose') || res.errors.length) { res.errors.forEach(e => console.log('  ERROR ' + e)); res.warnings.forEach(w => console.log('  WARN  ' + w)); }
  console.log(`livon-performance-quality: ${res.errors.length} error(s), ${res.warnings.length} warning(s) · ${JSON.stringify(res.stats)} · static checks only (timings are measured in a browser)`);
  if (res.errors.length) process.exit(1);
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
