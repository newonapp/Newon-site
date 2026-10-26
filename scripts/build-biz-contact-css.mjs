#!/usr/bin/env node
/**
 * Builds /biz-contact.css — the ONGIL Contact page design (owner, 2026-10-26: "6개 사업 각각 … 문의 화면 기능이랑
 * 디자인 ONGIL 문의 화면처럼") for the other five business Contact pages (LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD).
 *
 * The rules are DERIVED from the ONGIL sources, so the five pages stay identical to ONGIL's Contact page:
 *   home-lifestage.css + home-lifestage-layout.css (shared Life Stage base) + ongil-site.css (ONGIL components)
 * Only rules that style the Contact components are kept (selectors scoped to #lifestage-detail.nls / .ogs whose
 * classes are Contact-page classes; hero, film, menu and other-page components are dropped). Then:
 *   #lifestage-detail.nls / #lifestage-detail.ogs → #bct-contact   (the kit's own wrapper, see biz-contact-kit.mjs)
 *   .ogs-*  → .bct-*      .nls-* / .nls__* → .bctn-* / .bctn__*      --ogs-* / --nls-* → --bct-* / --bctn-*
 *   ONGIL Warm Apricot literals → brand tokens (--bcx-pt, --bcx-pt-ink, --bcx-pt-hover, --bcx-wash, --bcx-on)
 * Each business sets those five tokens to its own brand colour (BRANDS below, light + dark).
 *
 *   node scripts/build-biz-contact-css.mjs          (also run by build-i18n.mjs before the five renderers)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = ["home-lifestage.css", "home-lifestage-layout.css", "ongil-site.css"];
export const BIZ_CONTACT_CSS_OUT = path.join(ROOT, "biz-contact.css");

/** Classes the Contact kit renders (ONGIL contact markup + the kit's own small additions). */
const KEEP = new Set(
  `nls-block nls-block--band nls-block--ink nls-btn nls-btn--ghost nls-note nls__wrap nls-kicker nls-lead
  ogs-actions ogs-band ogs-btn--accent ogs-channels ogs-channels__k ogs-channels__t ogs-channels__v ogs-cl ogs-close
  ogs-close__lead ogs-close__title ogs-dir__title ogs-eyebrow ogs-faq ogs-faq--2 ogs-guard ogs-guard__alert ogs-h2
  ogs-head ogs-head--split ogs-head__main ogs-ico ogs-ink ogs-lead ogs-mark ogs-note ogs-notice ogs-routes
  ogs-routes__alert ogs-routes__w ogs-sec ogs-sec--rule ogs-steps ogs-steps--3 ogs-steps--4 ogs-steps__n ogs-steps__top
  ogs-tgroup ogs-tgroup__en ogs-tgroup__h ogs-tgroup__t ogs-ticks ogs-tile ogs-tile--lg ogs-tint ogs-tlist
  ogs-tlist__ch ogs-tlist__go ogs-tlist__x ogs-link`.split(/\s+/).filter(Boolean)
);
/** Never carried over (hero, film, menu bar, other-page components that share a class above in an :is() list). */
const DROP = /\.(?:nls-film|ogs-film|ogs-hero|fsn|ogs-foot|nls-crumb|nls-hero|nls-story|nls-closebar)/;
const SCOPE = /#lifestage-detail\.(?:nls|ogs)(?![\w-])(?![.[])/;

/** Brand tokens per business: point fill, point text, hover/light point, pale band, text on a point fill. */
export const BRANDS = {
  livon: {
    light: { pt: "#f6d76b", ink: "#7a5d00", hover: "#f9e293", wash: "#fffaea", on: "#1a1a1a" },
    dark: { pt: "#f6d76b", ink: "#f6d76b", hover: "#f9e293", wash: "#12100a", on: "#1a1a1a" },
  },
  shareon: {
    light: { pt: "#7771e8", ink: "#554cc8", hover: "#554cc8", wash: "#efedff", on: "#ffffff" },
    dark: { pt: "#8c86ff", ink: "#b9b5ff", hover: "#b9b5ff", wash: "#1c1a33", on: "#121216" },
  },
  babylog: {
    light: { pt: "#e8628e", ink: "#b8336a", hover: "#b8336a", wash: "#fdf3f7", on: "#ffffff" },
    dark: { pt: "#ee7fa3", ink: "#f49ab8", hover: "#f7b3ca", wash: "#160d11", on: "#1a1a1a" },
  },
  petlog: {
    light: { pt: "#278a53", ink: "#1e6b41", hover: "#1e6b41", wash: "#e6f2ea", on: "#ffffff" },
    dark: { pt: "#4fbf80", ink: "#8fddb0", hover: "#8fddb0", wash: "#0c1511", on: "#0c1511" },
  },
  myworld: {
    light: { pt: "#1769ff", ink: "#1257d6", hover: "#1257d6", wash: "#eef3fc", on: "#ffffff" },
    dark: { pt: "#5b9bff", ink: "#8fb6ff", hover: "#8fb6ff", wash: "#0f1724", on: "#0a0a0a" },
  },
};

/* ── tiny CSS block parser (comments stripped; at-rules with blocks recurse) ── */
function parse(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  let i = 0;
  function block() {
    const out = [];
    while (i < css.length) {
      const close = css.indexOf("}", i);
      const open = css.indexOf("{", i);
      const semi = css.indexOf(";", i);
      if (close !== -1 && (open === -1 || close < open)) {
        // statements without a block before the "}" (none expected at rule level)
        i = close + 1;
        return out;
      }
      if (open === -1) break;
      if (semi !== -1 && semi < open && css.slice(i, semi).trim().startsWith("@")) {
        out.push({ at: css.slice(i, semi).trim() + ";" });
        i = semi + 1;
        continue;
      }
      const head = css.slice(i, open).trim();
      i = open + 1;
      if (head.startsWith("@")) {
        if (/^@(media|supports|layer|container)/.test(head)) out.push({ at: head, kids: block() });
        else {
          // @keyframes / @font-face: skip the whole block
          let depth = 1;
          while (i < css.length && depth) {
            if (css[i] === "{") depth++;
            else if (css[i] === "}") depth--;
            i++;
          }
        }
        continue;
      }
      const end = css.indexOf("}", i);
      out.push({ sel: head, body: css.slice(i, end).trim() });
      i = end + 1;
    }
    return out;
  }
  return block();
}

/** Split a selector list on top-level commas. */
function splitSel(s) {
  const parts = [];
  let depth = 0,
    cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && !depth) {
      parts.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function keepSelector(sel) {
  if (!SCOPE.test(sel) || DROP.test(sel)) return false;
  const after = sel.slice(sel.search(SCOPE));
  const classes = [...after.matchAll(/\.((?:nls|ogs)[\w-]*)/g)].map((m) => m[1]).filter((c) => !/^(nls|ogs)$/.test(c));
  if (!classes.length) return true; // element / variable rules on the scope itself
  // inside :is()/:where() lists, one kit class is enough; outside, every class must be a kit class
  const outside = after.replace(/:(?:is|where|not)\((?:[^()]|\([^()]*\))*\)/g, "");
  const outClasses = [...outside.matchAll(/\.((?:nls|ogs)[\w-]*)/g)].map((m) => m[1]).filter((c) => !/^(nls|ogs)$/.test(c));
  if (outClasses.some((c) => !KEEP.has(c))) return false;
  return classes.some((c) => KEEP.has(c)) || !outClasses.length;
}

const rgba = (r, g, b) => new RegExp(`rgba\\(\\s*${r},\\s*${g},\\s*${b},\\s*([\\d.]+)\\s*\\)`, "g");
const mix = (token) => (m, a) => `color-mix(in srgb, var(${token}) ${Math.round(parseFloat(a) * 100)}%, transparent)`;

function recolor(body, sel = "") {
  const onAccent = /#e99465|apricot|#f0a97f/.test(body) || /tlist__go:hover|btn--accent/.test(sel);
  let b = body
    .replace(/#e99465\b/gi, "var(--bcx-pt)")
    .replace(/#f0a97f\b/gi, "var(--bcx-pt-hover)")
    .replace(/#a84e24\b/gi, "var(--bcx-pt-ink)")
    .replace(/#fff3eb\b/gi, "var(--bcx-wash)")
    .replace(/#17110d\b/gi, "var(--bcx-wash)")
    .replace(rgba(233, 148, 101), mix("--bcx-pt"))
    .replace(rgba(240, 169, 127), mix("--bcx-pt-hover"))
    .replace(rgba(168, 78, 36), mix("--bcx-pt-ink"));
  if (onAccent) b = b.replace(/#1a1a1a\b/gi, "var(--bcx-on)");
  return b;
}

const rename = (s) =>
  s
    .replace(new RegExp(SCOPE.source, "g"), "#bct-contact")
    .replace(/\.ogs-/g, ".bct-")
    .replace(/\.nls__/g, ".bctn__")
    .replace(/\.nls-/g, ".bctn-")
    .replace(/--ogs-/g, "--bct-")
    .replace(/--nls-/g, "--bctn-");

function emit(nodes, indent = "") {
  const out = [];
  for (const n of nodes) {
    if (n.kids) {
      const inner = emit(n.kids, indent + "  ");
      if (inner.trim()) out.push(`${indent}${n.at} {\n${inner}${indent}}\n`);
    } else if (n.sel) {
      const sels = splitSel(n.sel).filter(keepSelector);
      if (!sels.length || !n.body) continue;
      out.push(`${indent}${sels.map(rename).join(",\n" + indent)} {\n${indent}  ${rename(recolor(n.body, sels.join(","))).replace(/\n\s*/g, `\n${indent}  `)}\n${indent}}\n`);
    }
  }
  return out.join("");
}

function brandBlock() {
  const tok = (t) => `--bcx-pt: ${t.pt}; --bcx-pt-ink: ${t.ink}; --bcx-pt-hover: ${t.hover}; --bcx-wash: ${t.wash}; --bcx-on: ${t.on};`;
  return Object.entries(BRANDS)
    .map(
      ([biz, b]) =>
        `#bct-contact[data-bct-biz="${biz}"] { ${tok(b.light)} }\nhtml[data-newon-shell-theme="dark"] #bct-contact[data-bct-biz="${biz}"] { ${tok(b.dark)} }\n`
    )
    .join("");
}

/** Kit-only additions (not in ONGIL): the wrapper itself, route rows with a 문의하기 action, small text address. */
const EXTRA = `
#bct-contact { display: block; background: var(--bct-card, #fff); color: var(--bct-ink); overflow-x: clip; }
html[data-newon-shell-theme="dark"] #bct-contact { background: #0a0a0a; }
#bct-contact .bct-routes__go { margin: 0; }
#bct-contact .bct-routes__go a { display: inline-block; color: var(--bct-apricot-ink); font-weight: 700; text-decoration: none; }
#bct-contact .bct-routes__go a:hover, #bct-contact .bct-routes__go a:focus-visible { text-decoration: underline; text-underline-offset: 3px; }
#bct-contact .bct-channels__mail { color: var(--bct-ink); font-weight: 700; text-decoration: none; overflow-wrap: anywhere; }
#bct-contact .bct-channels__mail:hover { text-decoration: underline; text-underline-offset: 3px; }
#bct-contact .bct-guard a, #bct-contact .bct-faq a, #bct-contact .bct-note a { color: var(--bct-apricot-ink); text-underline-offset: 3px; }
#bct-contact .bct-tgroup__lead { margin: 0.6rem 0 0; color: var(--bct-muted); font-size: 0.9375rem; line-height: 1.6; }
#bct-contact .bct-tgroup__notes { margin: 0.75rem 0 0; display: grid; gap: 0.5rem; }
#bct-contact .bct-tgroup__notes p { margin: 0; color: var(--bct-faint); font-size: 0.875rem; line-height: 1.6; }
#bct-contact .bct-tlist__n { display: inline-block; min-width: 2.1em; color: var(--bct-apricot-ink); font-variant-numeric: tabular-nums; font-weight: 700; }
`;

/**
 * V4 visual layer (owner, 2026-10-26: "디자인 퀄리티 높게 다양하게") for all SIX Contact pages, written once and emitted
 * for two scopes: the kit (#bct-contact.bct, bct-* / bctn-*) and ONGIL's own Contact page
 * (#lifestage-detail.ogs[data-ogs-page="contact"], ogs-* / nls-* — the page also links /biz-contact.css).
 * Same family everywhere: asymmetric channels + illustrative unified-page screen, purpose cards (mobile snap rail),
 * group jump bar + icon group heads, numbered steps with brand rules, row callouts, split closing band.
 * Each business keeps its own brand tokens (--bcx-*), icon set (biz-contact-v4.mjs) and corner radius (--cx-r).
 * No grey surfaces (white + thin outlines + the brand's own wash), no ornaments, dark mode via !important overrides.
 *   $R = scope root · $P = component prefix (bct | ogs) · $N = shell prefix (bctn | nls)
 */
const ONGIL_ROOT = '#lifestage-detail.ogs[data-ogs-page="contact"]';
const V4 = `
$R { --cx-r: 18px; --cx-r-sm: 12px; --cx-line: color-mix(in srgb, var(--bcx-pt-ink) 16%, var(--$P-line)); }
$R .$P-eyebrow { display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.8125rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--bcx-pt-ink); }
$R .$P-eyebrow::before { content: ""; flex: none; width: 1.5rem; height: 2px; border-radius: 2px; background: var(--bcx-pt); }
$R .$P-h2 { font-size: clamp(1.85rem, 3vw, 2.7rem); line-height: 1.18; letter-spacing: -0.042em; }
$R .$P-tile { background: color-mix(in srgb, var(--bcx-pt) 15%, var(--$P-card)); color: var(--bcx-pt-ink); }
$R .$P-notice { background: var(--$P-card); border: 1px solid var(--cx-line); }

/* A · channels (left) + illustrative unified-page screen (right) */
$R .$P-chx { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1rem; }
@media (min-width: 900px) { $R .$P-chx { grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr); gap: 1.25rem; align-items: stretch; } }
$R .$P-chx .$P-channels { grid-template-columns: minmax(0, 1fr); gap: 0.75rem; align-content: start; }
$R .$P-chx .$P-channels li { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 1.1rem; align-items: start; padding: 1.3rem 1.4rem 1.35rem; border: 1px solid var(--cx-line); border-radius: var(--cx-r); background: var(--$P-card); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
$R .$P-chx .$P-channels li > .$P-tile { grid-row: 1 / span 3; }
$R .$P-chx .$P-channels li > :not(.$P-tile) { grid-column: 2; }
$R .$P-chx .$P-channels__k { margin: 0.15rem 0 0.1rem !important; font-size: 0.875rem; }
$R .$P-chx .$P-channels__v { min-height: 40px; font-size: clamp(1.3rem, 2vw, 1.7rem); }
$R .$P-chx .$P-channels__t { margin-top: 0.35rem !important; font-size: 0.9688rem; line-height: 1.62; }
$R .$P-chx .$P-channels li:first-child { border-color: color-mix(in srgb, var(--bcx-pt) 45%, transparent); background: var(--bcx-wash); }
$R .$P-chx .$P-channels li:first-child .$P-tile { background: var(--bcx-pt); color: var(--bcx-on); }
$R .$P-chx .$P-channels li:hover { border-color: var(--bcx-pt); box-shadow: 0 14px 32px -26px color-mix(in srgb, var(--bcx-pt-ink) 70%, transparent); }
@media (min-width: 600px) {
  $R .$P-chx .$P-channels:is([data-n="4"], [data-n="6"]) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  $R .$P-chx .$P-channels:is([data-n="4"], [data-n="6"]) li { display: flex; flex-direction: column; align-items: flex-start; }
  $R .$P-chx .$P-channels:is([data-n="4"], [data-n="6"]) .$P-channels__k { margin-top: 0.9rem !important; }
  $R .$P-chx .$P-channels:is([data-n="4"], [data-n="6"]) .$P-channels__v { font-size: 1.2rem; }
}
@media (min-width: 900px) {
  /* two or three channels next to the taller screen: the first (e-mail) panel fills the column, address at the bottom */
  $R .$P-chx .$P-channels:not([data-n="4"]):not([data-n="5"]):not([data-n="6"]) { display: flex; flex-direction: column; }
  $R .$P-chx .$P-channels:not([data-n="4"]):not([data-n="5"]):not([data-n="6"]) > li:first-child { display: flex; flex: 1; flex-direction: column; align-items: flex-start; justify-content: flex-end; padding: 1.6rem 1.75rem 1.75rem; }
  $R .$P-chx .$P-channels:not([data-n="4"]):not([data-n="5"]):not([data-n="6"]) > li:first-child > .$P-tile { margin-bottom: auto; }
  $R .$P-chx .$P-channels:not([data-n="4"]):not([data-n="5"]):not([data-n="6"]) > li:first-child .$P-channels__k { margin-top: 2rem !important; }
  $R .$P-chx .$P-channels:not([data-n="4"]):not([data-n="5"]):not([data-n="6"]) > li:first-child .$P-channels__v { font-size: clamp(1.9rem, 2.9vw, 2.6rem); }
}
$R .$P-mock { display: flex; flex-direction: column; min-width: 0; margin: 0; overflow: hidden; border: 1px solid var(--cx-line); border-radius: var(--cx-r); background: var(--$P-card); box-shadow: 0 24px 48px -36px color-mix(in srgb, var(--bcx-pt-ink) 60%, transparent); }
$R .$P-mock__bar { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.7rem 1.1rem; border-bottom: 1px solid var(--cx-line); background: var(--bcx-wash); }
$R .$P-mock__tag { display: inline-flex; align-items: center; padding: 0.18rem 0.65rem; border: 1px solid color-mix(in srgb, var(--bcx-pt-ink) 45%, transparent); border-radius: 999px; font-size: 0.75rem; font-weight: 750; letter-spacing: 0.03em; color: var(--bcx-pt-ink); }
$R .$P-mock__url { font-size: 0.8125rem; font-variant-numeric: tabular-nums; color: var(--$P-faint); }
$R .$P-mock__body { display: flex; flex: 1; flex-direction: column; gap: 0.95rem; padding: 1.3rem 1.4rem 1.4rem; }
$R .$P-mock__f:last-child { display: flex; flex: 1; flex-direction: column; }
$R .$P-mock__f:last-child .$P-mock__in--tall { flex: 1; }
$R .$P-mock__t { font-size: 1.125rem; font-weight: 750; letter-spacing: -0.02em; color: var(--$P-ink); }
$R .$P-mock__l { margin-bottom: 0.35rem !important; font-size: 0.8125rem; font-weight: 700; color: var(--$P-muted); }
$R :is(.$P-mock__sel, .$P-mock__in) { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 2.6rem; padding: 0.5rem 0.85rem; border: 1px solid var(--$P-line-2); border-radius: var(--cx-r-sm); font-size: 0.9375rem; line-height: 1.5; }
$R .$P-mock__sel { border-color: var(--bcx-pt); box-shadow: 0 0 0 3px color-mix(in srgb, var(--bcx-pt) 20%, transparent); font-weight: 750; color: var(--$P-ink); }
$R .$P-mock__sel .$P-mark { width: 1.25rem; height: 1.25rem; color: var(--bcx-pt-ink); }
$R .$P-mock__in { color: var(--$P-faint); }
$R .$P-mock__in--tall { align-items: flex-start; min-height: 5.25rem; }
$R .$P-mock__hint { margin-top: 0.45rem !important; font-size: 0.8125rem; line-height: 1.55; color: var(--$P-faint); }
$R .$P-mock__steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--cx-line); }
$R .$P-mock__steps li { padding: 0.75rem 1rem 0.85rem; font-size: 0.8125rem; line-height: 1.45; color: var(--$P-muted); }
$R .$P-mock__steps li + li { border-left: 1px solid var(--cx-line); }
$R .$P-mock__steps b { display: block; margin-bottom: 0.1rem; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--bcx-pt-ink); }

/* A2 · purposes as icon cards (desktop grid, mobile snap rail) */
$R .$P-routes--cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.85rem; border-top: 0; }
/* 2 / 3 columns on a 4 / 6 track grid so a short last row is shared out instead of leaving empty cells */
@media (min-width: 760px) {
  $R .$P-routes--cards { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  $R .$P-routes--cards > li { grid-column: span 2; }
  $R .$P-routes--cards > li:last-child:nth-child(odd) { grid-column: 1 / -1; }
}
@media (min-width: 1100px) {
  $R .$P-routes--cards { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  $R .$P-routes--cards > li, $R .$P-routes--cards > li:last-child:nth-child(odd) { grid-column: span 2; }
  $R .$P-routes--cards > li:last-child:nth-child(3n + 1) { grid-column: 1 / -1; }
  $R .$P-routes--cards > li:nth-last-child(2):nth-child(3n + 1), $R .$P-routes--cards > li:nth-last-child(2):nth-child(3n + 1) + li { grid-column: span 3; }
}
/* a card alone on its row reads as one wide row: icon · text · action */
@media (min-width: 760px) and (max-width: 1099px) {
  $R .$P-routes--cards > li:last-child:nth-child(odd) { flex-direction: row; align-items: center; gap: 1.25rem; }
  $R .$P-routes--cards > li:last-child:nth-child(odd) .$P-routes__w { margin-top: 0; }
}
@media (min-width: 1100px) {
  $R .$P-routes--cards > li:last-child:nth-child(3n + 1) { flex-direction: row; align-items: center; gap: 1.25rem; }
  $R .$P-routes--cards > li:last-child:nth-child(3n + 1) .$P-routes__w { margin-top: 0; }
}
$R .$P-routes--cards > li { display: flex; flex-direction: column; align-items: flex-start; gap: 0.8rem; padding: 1.25rem 1.3rem 1.2rem; border: 1px solid var(--cx-line); border-radius: var(--cx-r); background: var(--$P-card); transition: border-color 0.2s ease, box-shadow 0.2s ease; }
$R .$P-routes--cards > li > div { flex: 1; }
$R .$P-routes--cards h3 { font-size: 1.125rem; }
$R .$P-routes--cards .$P-routes__w { max-width: none; margin-top: auto; padding: 0; border: 0; text-align: left; }
$R .$P-routes--cards .$P-routes__go a { display: inline-flex; align-items: center; min-height: 44px; box-sizing: border-box; padding: 0.45rem 1.05rem; border: 1.5px solid color-mix(in srgb, var(--bcx-pt-ink) 35%, transparent); border-radius: 999px; color: var(--bcx-pt-ink); transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease; }
$R .$P-routes--cards > li:hover { border-color: var(--bcx-pt); box-shadow: 0 14px 32px -26px color-mix(in srgb, var(--bcx-pt-ink) 70%, transparent); }
$R .$P-routes--cards > li:hover .$P-routes__go a, $R .$P-routes--cards .$P-routes__go a:focus-visible { background: var(--bcx-pt); border-color: var(--bcx-pt); color: var(--bcx-on); text-decoration: none; }
$R .$P-routes--cards p.$P-routes__w:not(.$P-routes__go) { padding: 0.35rem 0.85rem; border: 1px solid var(--$P-line-2); border-radius: 999px; font-size: 0.9375rem; color: var(--$P-muted); }
$R .$P-routes--cards:focus-visible { outline: 2px solid var(--bcx-pt); outline-offset: 4px; border-radius: var(--cx-r); }
@media (max-width: 759px) {
  $R .$P-routes--cards { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: minmax(16rem, 84%); overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scroll-padding-inline: 2px; padding: 2px 2px 0.75rem; }
  $R .$P-routes--cards > li { scroll-snap-align: start; }
}

/* B · inquiry types: jump bar, icon group heads, outlined rows with one brand action */
$R .$P-tjump { margin: 0 0 1.75rem; }
$R .$P-tjump ul { display: flex; flex-wrap: wrap; gap: 0.5rem; }
$R .$P-tjump a { display: inline-flex; align-items: center; gap: 0.55rem; min-height: 44px; box-sizing: border-box; padding: 0.35rem 0.45rem 0.35rem 0.85rem; border: 1px solid color-mix(in srgb, var(--bcx-pt-ink) 24%, transparent); border-radius: 999px; background: var(--$P-card); font-size: 0.9375rem; font-weight: 700; color: var(--$P-ink); text-decoration: none; transition: border-color 0.18s ease; }
$R .$P-tjump a:hover, $R .$P-tjump a:focus-visible { border-color: var(--bcx-pt-ink); }
$R .$P-tjump .$P-mark { width: 1.15rem; height: 1.15rem; color: var(--bcx-pt-ink); }
$R .$P-tjump__n { min-width: 1.7rem; padding: 0.1rem 0.45rem; border-radius: 999px; background: var(--bcx-pt); font-size: 0.75rem; font-weight: 800; font-variant-numeric: tabular-nums; text-align: center; color: var(--bcx-on); }
@media (max-width: 759px) {
  $R .$P-tjump ul { flex-wrap: nowrap; overflow-x: auto; overscroll-behavior-x: contain; padding: 2px 2px 0.5rem; }
  $R .$P-tjump li { flex: none; }
}
$R .$P-tgroup { scroll-margin-top: 9rem; }
$R .$P-tgroup__h { padding-top: 1rem; border-top: 2px solid var(--bcx-pt); }
$R .$P-tgroup__h > .$P-tile { width: 2.75rem; height: 2.75rem; margin-bottom: 0.85rem; background: var(--$P-card); border: 1px solid color-mix(in srgb, var(--bcx-pt-ink) 24%, transparent); }
$R .$P-tlist { overflow: hidden; border: 1px solid var(--cx-line); border-radius: var(--cx-r); }
$R .$P-tlist > li { transition: background-color 0.18s ease; }
$R .$P-tlist > li:hover { background: color-mix(in srgb, var(--bcx-wash) 55%, var(--$P-card)); }
$R .$P-tlist .$P-tlist__go { padding: 0.55rem 1.15rem; border-color: color-mix(in srgb, var(--bcx-pt-ink) 32%, transparent); color: var(--bcx-pt-ink); }
$R .$P-tlist > li:hover .$P-tlist__go, $R .$P-tlist .$P-tlist__go:focus-visible { border-color: var(--bcx-pt); background: var(--bcx-pt); color: var(--bcx-on); }
$R .$P-tlist__n { display: inline-flex; align-items: center; justify-content: center; min-width: 2.3rem; height: 1.6rem; margin-right: 0.65rem; padding: 0 0.35rem; border-radius: 8px; background: var(--bcx-wash); font-size: 0.8125rem; vertical-align: 0.12em; color: var(--bcx-pt-ink); }

/* short rows (title + suggested subject) → two-column grid inside one outlined panel */
@media (min-width: 760px) {
  $R .$P-tlist--grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  $R .$P-tlist--grid > li { grid-template-columns: minmax(0, 1fr) auto; gap: 1rem; padding: 1.2rem 1.4rem; }
  $R .$P-tlist--grid > li + li { border-top: 0; }
  $R .$P-tlist--grid > li:nth-child(n + 3) { border-top: 1px solid var(--cx-line); }
  $R .$P-tlist--grid > li:nth-child(odd) { border-right: 1px solid var(--cx-line); }
  $R .$P-tlist--grid > li:last-child:nth-child(odd) { grid-column: 1 / -1; border-right: 0; }
  $R .$P-tlist--grid h3 { font-size: 1.0625rem; }
  $R .$P-tlist--grid .$P-tlist__x p { font-size: 0.9375rem; }
}

/* B2 · real sequence: brand rules that fill step by step */
$R .$P-steps li { padding-top: 1.15rem; border-top: 3px solid color-mix(in srgb, var(--bcx-pt) 32%, transparent); }
$R .$P-steps li:first-child { border-top-color: var(--bcx-pt); }
$R .$P-steps li:nth-child(2) { border-top-color: color-mix(in srgb, var(--bcx-pt) 66%, transparent); }
$R .$P-steps__n { font-size: 2.1rem; font-weight: 800; line-height: 1; letter-spacing: -0.04em; color: var(--bcx-pt-ink); }

/* C · before you get in touch: outlined checklist cards, callouts as icon rows */
$R .$P-cl > li { border-color: var(--cx-line); border-radius: var(--cx-r); }
$R .$P-cl h3 { padding-bottom: 0.55rem; border-bottom: 1px solid var(--cx-line); }
/* many one-line checklist groups → a two-column list of rows (group | what to include) instead of uneven cards */
$R .$P-cl--rows { display: block; columns: 2 24rem; column-gap: 2.75rem; margin-bottom: 1.5rem; border-top: 1px solid var(--$P-line-2); }
$R .$P-cl--rows > li { display: grid; grid-template-columns: minmax(8.5rem, 0.42fr) minmax(0, 1fr); gap: 0.4rem 1.25rem; break-inside: avoid; padding: 0.95rem 0; border: 0; border-bottom: 1px solid var(--cx-line); border-radius: 0; }
$R .$P-cl--rows h3 { margin: 0 !important; padding: 0; border: 0; font-size: 1rem; line-height: 1.55; }
$R .$P-cl--rows .$P-ticks li { font-size: 0.9688rem; }
@media (max-width: 520px) { $R .$P-cl--rows > li { grid-template-columns: minmax(0, 1fr); } }
$R .$P-guard { grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); }
$R .$P-guard li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 1rem; align-items: start; border-color: var(--cx-line); border-radius: var(--cx-r); }
$R .$P-guard li p { margin-top: 0.2rem !important; }
$R .$P-guard li .$P-tile { width: 2.75rem; height: 2.75rem; }
$R .$P-cl:not(.$P-cl--rows) { grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr)); }
/* four or more notes → a two-column list of icon rows; the emergency note stays a full-width red box */
$R .$P-guard--list { grid-template-columns: minmax(0, 1fr); gap: 0 2.75rem; border-top: 1px solid var(--$P-line-2); }
@media (min-width: 900px) { $R .$P-guard--list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
$R .$P-guard--list > li:not(.$P-guard__alert) { padding: 1.05rem 0; border: 0; border-bottom: 1px solid var(--cx-line); border-radius: 0; }
$R .$P-guard--list > li .$P-tile { width: 2.5rem; height: 2.5rem; }
$R .$P-guard--list > li p { font-size: 1rem; line-height: 1.65; }
$R .$P-guard--list > .$P-guard__alert { grid-column: 1 / -1; margin-top: 1.25rem; padding: 1.25rem 1.4rem; order: 99; }
@media (min-width: 900px) {
  $R .$P-guard--list > li:nth-child(odd):not(.$P-guard__alert):is(:last-child, :has(+ .$P-guard__alert)) { grid-column: 1 / -1; }
  $R .$P-guard[data-n="4"]:not(.$P-guard--list) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* C2 · FAQ */
$R .$P-faq summary::after { border: 1px solid color-mix(in srgb, var(--bcx-pt-ink) 30%, transparent); background: var(--$P-card); color: var(--bcx-pt-ink); }
$R .$P-faq details[open] summary { color: var(--bcx-pt-ink); }

/* D · black closing band: statement left, action right */
$R .$P-ink .$P-eyebrow { color: var(--bcx-pt-hover); }
$R .$P-ink .$P-eyebrow::before { background: var(--bcx-pt); }
$R .$P-close .$N-btn.$P-btn--accent { min-height: 56px; padding-inline: 1.9rem; font-size: 1.0625rem; }
@media (min-width: 900px) {
  $R .$P-close { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 3rem; align-items: center; max-width: none; text-align: left; }
  $R .$P-close > * { grid-column: 1; margin-left: 0 !important; margin-right: 0 !important; }
  $R .$P-close > .$P-actions { grid-column: 2; grid-row: 1 / span 5; justify-content: flex-end; margin: 0 !important; }
  $R .$P-close__lead { max-width: 40rem; }
}

/* hover / motion */
@media (prefers-reduced-motion: reduce) { $R .$N__wrap * { transition: none !important; } }

/* dark mode (site-dark.css + the kit force colours with !important; these win by specificity) */
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock, .$P-routes--cards > li, .$P-tjump a, .$P-chx .$P-channels li:not(:first-child), .$P-tlist, .$P-cl:not(.$P-cl--rows) > li, .$P-guard:not(.$P-guard--list) li:not(.$P-guard__alert), .$P-notice) { background-color: #121212 !important; border-color: rgba(255, 255, 255, 0.16) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__bar, .$P-chx .$P-channels li:first-child, .$P-tlist__n) { background-color: var(--bcx-wash) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-chx .$P-channels li:first-child { border-color: color-mix(in srgb, var(--bcx-pt) 45%, transparent) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-chx .$P-channels li:first-child .$P-tile, .$P-tjump__n) { background-color: var(--bcx-pt) !important; color: var(--bcx-on) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__sel) { border-color: var(--bcx-pt) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__in, .$P-mock__steps li + li, .$P-mock__steps, .$P-mock__bar, .$P-cl h3) { border-color: rgba(255, 255, 255, 0.16) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__tag, .$P-mock__steps b, .$P-tlist__n, .$P-tjump .$P-mark, .$P-mock__sel .$P-mark, .$P-tlist__go, .$P-tlist__go span, .$P-routes--cards .$P-routes__go a, .$P-steps__n) { color: var(--bcx-pt-hover) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__in, .$P-mock__hint, .$P-mock__url) { color: rgba(245, 245, 245, 0.6) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-mock__tag, .$P-tlist__go, .$P-routes--cards .$P-routes__go a, .$P-tjump a) { border-color: color-mix(in srgb, var(--bcx-pt-hover) 45%, transparent) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-tlist > li:hover { background-color: color-mix(in srgb, var(--bcx-pt) 8%, #121212) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-tlist > li:hover .$P-tlist__go, .$P-routes--cards > li:hover .$P-routes__go a) { background-color: var(--bcx-pt) !important; border-color: var(--bcx-pt) !important; color: var(--bcx-on) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-tlist > li:hover .$P-tlist__go span) { color: var(--bcx-on) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-eyebrow::before { background-color: var(--bcx-pt) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-steps li { border-top-color: color-mix(in srgb, var(--bcx-pt) 32%, transparent) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-steps li:nth-child(2) { border-top-color: color-mix(in srgb, var(--bcx-pt) 66%, transparent) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-steps li:first-child { border-top-color: var(--bcx-pt) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap :is(.$P-guard--list > li:not(.$P-guard__alert), .$P-cl--rows > li) { border-color: rgba(255, 255, 255, 0.14) !important; }
html[data-newon-shell-theme="dark"] body $R .$N__wrap .$P-tgroup__h > .$P-tile { border-color: color-mix(in srgb, var(--bcx-pt-hover) 35%, transparent) !important; }
`;

/** Per-business character on top of V4: corner radius (soft for family/baby/life, crisp for travel/sharing). */
const V4_BRANDS = `
#bct-contact.bct[data-bct-biz="livon"] { --cx-r: 22px; --cx-r-sm: 14px; }
#bct-contact.bct[data-bct-biz="babylog"] { --cx-r: 24px; --cx-r-sm: 16px; }
#bct-contact.bct[data-bct-biz="petlog"] { --cx-r: 18px; --cx-r-sm: 12px; }
#bct-contact.bct[data-bct-biz="shareon"] { --cx-r: 14px; --cx-r-sm: 10px; }
#bct-contact.bct[data-bct-biz="myworld"] { --cx-r: 10px; --cx-r-sm: 8px; }
${ONGIL_ROOT} { --bcx-pt: #e99465; --bcx-pt-ink: #a84e24; --bcx-pt-hover: #f0a97f; --bcx-wash: #fff3eb; --bcx-on: #1a1a1a; }
html[data-newon-shell-theme="dark"] ${ONGIL_ROOT} { --bcx-pt-ink: #f0a97f; --bcx-wash: #17110d; }
${ONGIL_ROOT} { --cx-r: 16px; --cx-r-sm: 12px; }
`;

function v4Layer() {
  const fill = (R, P, N) => V4.replace(/\$R/g, R).replace(/\$P/g, P).replace(/\$N/g, N);
  return `${fill("#bct-contact.bct", "bct", "bctn")}\n/* ── ONGIL Contact page (same layer, ONGIL class names) ── */\n${fill(ONGIL_ROOT, "ogs", "nls")}${V4_BRANDS}`;
}

export function buildBizContactCss() {
  const parts = SOURCES.map((f) => `/* ── from ${f} ── */\n${emit(parse(fs.readFileSync(path.join(ROOT, f), "utf8")))}`);
  const css = `/* GENERATED by scripts/build-biz-contact-css.mjs from ${SOURCES.join(" + ")} — do not edit by hand.
   ONGIL Contact page design for the LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD Contact pages (#bct-contact). */
${brandBlock()}
${parts.join("\n")}
/* ── kit additions ── */${EXTRA}
/* ── V4 visual layer (six Contact pages) ── */${v4Layer()}`;
  fs.writeFileSync(BIZ_CONTACT_CSS_OUT, css);
  return css.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = buildBizContactCss();
  console.log(`build-biz-contact-css: wrote biz-contact.css (${n} bytes)`);
}
