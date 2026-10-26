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

export function buildBizContactCss() {
  const parts = SOURCES.map((f) => `/* ── from ${f} ── */\n${emit(parse(fs.readFileSync(path.join(ROOT, f), "utf8")))}`);
  const css = `/* GENERATED by scripts/build-biz-contact-css.mjs from ${SOURCES.join(" + ")} — do not edit by hand.
   ONGIL Contact page design for the LIVON · SHAREON · BABYLOG · PETLOG · MY WORLD Contact pages (#bct-contact). */
${brandBlock()}
${parts.join("\n")}
/* ── kit additions ── */${EXTRA}`;
  fs.writeFileSync(BIZ_CONTACT_CSS_OUT, css);
  return css.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const n = buildBizContactCss();
  console.log(`build-biz-contact-css: wrote biz-contact.css (${n} bytes)`);
}
