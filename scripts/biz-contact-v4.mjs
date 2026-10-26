/**
 * Contact page v4 visual layer (owner, 2026-10-26: "6개 사업 모든 메뉴 화면 … 디자인 퀄리티 높게 다양하게") —
 * shared by the ONGIL Contact page (render-ongil-site.mjs contactMain) and the five kit Contact pages
 * (biz-contact-kit.mjs). Same ONGIL structure; this only adds visual devices:
 *   - an illustrative screen ("예시 화면" / "Illustrative") of the unified Contact page as the "문의하기" link opens it:
 *     the business preselected as the related platform, and the page's own field labels / placeholders / steps
 *     (contact-page-copy.mjs). No new facts, no form controls (plain text boxes).
 *   - one line-icon set per business (inquiry purposes by unified type, audience groups in order)
 *   - a jump bar to the audience groups of the inquiry types
 * Markup uses ONGIL class names (ogs-*); the kit renames them to bct-* on output. CSS: build-biz-contact-css.mjs (V4).
 */
import { escapeHtml } from "./hub-utils.mjs";
import { icon as ongilIcon } from "./ongil-site-icons.mjs";
import { getContactPageCopy } from "./contact-page-copy.mjs";

const e = (s) => escapeHtml(s == null ? "" : String(s));

/** A few business-specific glyphs (24×24, stroke = currentColor) on top of the shared ONGIL line set. */
const EXTRA = {
  paw: '<path d="M12 13.5c-2.6 0-5 2.4-5 4.6 0 1.5 1.2 2.4 2.6 2.4 1 0 1.6-.5 2.4-.5s1.4.5 2.4.5c1.4 0 2.6-.9 2.6-2.4 0-2.2-2.4-4.6-5-4.6z"/><path d="M7.2 10.8c.9-.3 1.2-1.6.7-2.8s-1.6-1.9-2.5-1.6-1.2 1.6-.7 2.8 1.6 1.9 2.5 1.6zM16.8 10.8c-.9-.3-1.2-1.6-.7-2.8s1.6-1.9 2.5-1.6 1.2 1.6.7 2.8-1.6 1.9-2.5 1.6zM10.3 7.6c1-.1 1.6-1.3 1.4-2.6S10.5 2.9 9.6 3s-1.6 1.3-1.4 2.6 1.1 2.1 2.1 2zM13.7 7.6c-1-.1-1.6-1.3-1.4-2.6s1.2-2.1 2.1-2 1.6 1.3 1.4 2.6-1.1 2.1-2.1 2z"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 15 12 21 12 21z"/><path d="M9.8 9.8a2.2 2.2 0 1 0 4.4 0 2.2 2.2 0 1 0-4.4 0"/>',
  suitcase: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4.5h6V7M9 11v5M15 11v5"/>',
  swap: '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>',
  sprout: '<path d="M12 20.5V11"/><path d="M12 11c0-3.6-2.6-6-6.5-6 0 3.8 2.6 6 6.5 6zM12 13.5c0-3 2.3-5.2 6.5-5.2 0 3.4-2.6 5.2-6.5 5.2z"/><path d="M7.5 20.5h9"/>',
  stroller: '<path d="M4 5h2.2l1.6 8.5h9.4l2-6.2H7"/><path d="M8.5 16.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6M16.5 16.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 1 0 0-3.6"/>',
};

/** Inline SVG for one icon key (business glyphs first, then the shared ONGIL line set). */
export function cicon(name, cls = "ogs-ico") {
  if (!EXTRA[name]) return ongilIcon(name, cls);
  return `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${EXTRA[name]}</svg>`;
}

/** One icon set per business: the "personal" purpose glyph + audience-group glyphs in group order. */
export const CONTACT_ICONS = {
  ongil: { personal: "sun", groups: ["person", "building", "chat"] },
  livon: { personal: "sprout", groups: ["person", "book", "briefcase"] },
  shareon: { personal: "swap", groups: ["users", "link"] },
  babylog: { personal: "stroller", groups: ["heart", "building", "shield"] },
  petlog: { personal: "paw", groups: ["paw", "heart", "bag", "shield", "globe"] },
  myworld: { personal: "pin", groups: ["pin", "suitcase", "building", "chat"] },
};
const TYPE_ICON = { personal: "person", business: "briefcase", public: "landmark", partnership: "link", media: "chat", investment: "spark" };
export const typeIcon = (biz, type) => (type === "personal" && CONTACT_ICONS[biz] ? CONTACT_ICONS[biz].personal : TYPE_ICON[type] || "info");
export const groupIcon = (biz, i) => {
  const g = (CONTACT_ICONS[biz] || {}).groups || [];
  return g[i] || g[g.length - 1] || "grid";
};

export const MOCK_LABEL = { ko: "예시 화면", en: "Illustrative" };

/**
 * Illustrative screen of the unified Contact page as the business's "문의하기" opens it (platform preselected).
 * Every string is the unified page's own copy; the panel is a figure of text boxes, not a form.
 */
export function contactMock(lang, contentLang, biz) {
  const L = contentLang === "ko" ? "ko" : "en";
  const c = getContactPageCopy(L);
  const name = (c.platforms && c.platforms[biz]) || biz.toUpperCase();
  const tag = MOCK_LABEL[L];
  const check = `<span class="ogs-mark">${cicon("check")}</span>`;
  return `<figure class="ogs-mock" aria-label="${e(`${tag} — ${c.formTitle}`)}">
        <div class="ogs-mock__bar"><span class="ogs-mock__tag">${e(tag)}</span><span class="ogs-mock__url" lang="en">/${e(lang)}/contact/</span></div>
        <div class="ogs-mock__body">
          <p class="ogs-mock__t">${e(c.formTitle)}</p>
          <div class="ogs-mock__f"><p class="ogs-mock__l">${e(c.platformLabel)}</p><p class="ogs-mock__sel"><span lang="en">${e(name)}</span>${check}</p></div>
          <div class="ogs-mock__f"><p class="ogs-mock__l">${e(c.subjectLabel)}</p><p class="ogs-mock__in">${e(c.subjectPlaceholder)}</p></div>
          <div class="ogs-mock__f"><p class="ogs-mock__l">${e(c.messageLabel)}</p><p class="ogs-mock__in ogs-mock__in--tall">${e(c.messagePlaceholder)}</p><p class="ogs-mock__hint">${e(c.messageHint)}</p></div>
        </div>
        <ol class="ogs-mock__steps">${(c.formSteps || [])
          .map(([n, t]) => `<li><b>${e(n)}</b>${e(t)}</li>`)
          .join("")}</ol>
      </figure>`;
}

/**
 * Jump bar to the audience groups of the inquiry types (group ids `${idp}-1` …). Counts are the rows per group.
 * @param groups [{ title, count }]
 */
export function typeJump(biz, idp, label, groups) {
  if (!groups || groups.length < 2) return "";
  return `<nav class="ogs-tjump" aria-label="${e(label)}"><ul>${groups
    .map(
      (g, i) =>
        `<li><a href="#${idp}-${i + 1}"><span class="ogs-mark">${cicon(groupIcon(biz, i))}</span><span>${e(g.title)}</span><span class="ogs-tjump__n">${e(g.count)}</span></a></li>`
    )
    .join("")}</ul></nav>`;
}
