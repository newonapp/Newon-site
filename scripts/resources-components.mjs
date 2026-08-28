/**
 * Reusable Resources detail / hub components (breadcrumb lives in render-resources.mjs).
 */

export function resourceMetaRow({ escapeHtml, items }) {
  const cells = (items || [])
    .filter((x) => x && x.label)
    .map(
      (x) => `<div class="rs-meta__cell">
      <span class="rs-k">${escapeHtml(x.label)}</span>
      <strong>${escapeHtml(x.value || "—")}</strong>
    </div>`
    )
    .join("");
  if (!cells) return "";
  return `<div class="rs-meta rs-detail__meta">${cells}</div>`;
}

export function resourceShare({ escapeHtml, url, title, copy = {} }) {
  const u = encodeURIComponent(url || "");
  const t = encodeURIComponent(title || "");
  return `<div class="rs-share" aria-label="${escapeHtml(copy.shareLabel || "Share")}">
    <span class="rs-k">${escapeHtml(copy.shareLabel || "SHARE")}</span>
    <a href="https://twitter.com/intent/tweet?url=${u}&text=${t}" target="_blank" rel="noopener noreferrer">X</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </div>`;
}

export function resourceRelatedList({ escapeHtml, title, items, emptyLabel }) {
  if (!items || !items.length) return "";
  const rows = items
    .map(
      (r) => `<a class="rs-related__item" href="${escapeHtml(r.url)}">
      <span class="rs-related__type">${escapeHtml(String(r.type || "").toUpperCase())}</span>
      <span class="rs-related__title">${escapeHtml(r.title)}</span>
      <span class="rs-related__arrow" aria-hidden="true">→</span>
    </a>`
    )
    .join("");
  return `<section class="rs-related" data-rs-reveal aria-labelledby="rs-related-title">
    <div class="rs-inner">
      <h2 class="rs-title" id="rs-related-title">${escapeHtml(title || "Related Resources")}</h2>
      <div class="rs-related__list">${rows}</div>
    </div>
  </section>`;
}

export function resourceRelatedProducts({ escapeHtml, title, products, base = "../../products/" }) {
  if (!products || !products.length) return "";
  const rows = products
    .map(
      (p) => `<a class="rs-related__item" href="${escapeHtml(typeof p === "string" ? `${base}${p}/` : p.href || `${base}${p.slug}/`)}">
      <span class="rs-related__type">PRODUCT</span>
      <span class="rs-related__title">${escapeHtml(typeof p === "string" ? p : p.title || p.slug)}</span>
      <span class="rs-related__arrow" aria-hidden="true">→</span>
    </a>`
    )
    .join("");
  return `<section class="rs-related rs-related--products" data-rs-reveal aria-labelledby="rs-related-products-title">
    <div class="rs-inner">
      <h2 class="rs-title" id="rs-related-products-title">${escapeHtml(title || "Related Products")}</h2>
      <div class="rs-related__list">${rows}</div>
    </div>
  </section>`;
}

export function resourcePrevNext({ escapeHtml, prev, next }) {
  if (!prev && !next) return "";
  const prevHtml = prev
    ? `<a class="rs-adjacent__link rs-adjacent__link--prev" href="${escapeHtml(prev.url)}"><span class="rs-k">${escapeHtml(prev.label || "Previous")}</span><strong>${escapeHtml(prev.title)}</strong></a>`
    : `<span class="rs-adjacent__spacer" aria-hidden="true"></span>`;
  const nextHtml = next
    ? `<a class="rs-adjacent__link rs-adjacent__link--next" href="${escapeHtml(next.url)}"><span class="rs-k">${escapeHtml(next.label || "Next")}</span><strong>${escapeHtml(next.title)}</strong></a>`
    : `<span class="rs-adjacent__spacer" aria-hidden="true"></span>`;
  return `<nav class="rs-adjacent" aria-label="Adjacent resources">${prevHtml}${nextHtml}</nav>`;
}

export function resourceCtaBand({ escapeHtml, title, lead, primaryHref, primaryLabel, secondaryHref, secondaryLabel }) {
  return `<section class="rs-cta-band" data-rs-reveal aria-labelledby="rs-cta-band-title">
    <div class="rs-inner rs-cta-band__inner">
      <div>
        <h2 class="rs-title" id="rs-cta-band-title">${escapeHtml(title || "")}</h2>
        ${lead ? `<p class="rs-lead">${escapeHtml(lead)}</p>` : ""}
      </div>
      <div class="rs-cta-band__actions">
        ${primaryHref ? `<a class="rs-btn rs-btn--primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel || "Get started →")}</a>` : ""}
        ${secondaryHref ? `<a class="rs-btn rs-btn--ghost" href="${escapeHtml(secondaryHref)}">${escapeHtml(secondaryLabel || "Learn more →")}</a>` : ""}
      </div>
    </div>
  </section>`;
}

export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}
