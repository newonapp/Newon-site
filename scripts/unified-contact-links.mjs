/**
 * Owner request (2026-10-26): each business keeps its own Contact menu page, but the inquiry buttons on that
 * page ("문의 양식", "문의하기", "Form" …) open the unified NEWON Contact page with the business preselected.
 *
 * Applied to the MAIN content of the six businesses' Contact pages only (not the header, footer or other pages).
 * Rewritten: links to the business inquiry forms (/{lang}/business/inquiry/…, /{lang}/business/contact/…) and the
 * page's own form shortcuts (…/{biz}/contact/?type=…). Kept: e-mail links, app store links, in-page anchors,
 * links to other menus, and links that already open /{lang}/contact/.
 */
const FORM_HREF = /^(?:(?:\.\.\/)+|\/[a-z]{2}(?:-[a-z]{2})?\/)?business\/(?:inquiry|contact)\/(?:[?#][^"]*)?$/i;

export function unifiedContactHref(lang, biz) {
  return `/${lang}/contact/?platform=${biz}`;
}

export function toUnifiedContact(html, lang, biz) {
  const self = new RegExp(`^(?:(?:\\.\\./)+|/${lang}/)?${biz}/contact/\\?[^"]*$`, "i");
  return html.replace(/(<a\b[^>]*?\bhref=")([^"]+)(")/g, (m, a, href, z) => {
    const h = href.replace(/&amp;/g, "&");
    if (!(FORM_HREF.test(h) || self.test(h))) return m;
    // keep the original query (inquiry type, source code) so the inquiry still says where it came from
    const q = (h.split("#")[0].split("?")[1] || "").split("&").filter((kv) => kv && !/^platform=/i.test(kv));
    const url = unifiedContactHref(lang, biz) + (q.length ? "&" + q.join("&") : "");
    return `${a}${url.replace(/&/g, "&amp;")}${z}`;
  });
}
