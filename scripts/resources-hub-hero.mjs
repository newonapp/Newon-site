/**
 * Resources hub hero — Business BUILD pillar pattern (bp-crumb + bp-hero + bp-mark).
 */

function combinedEyebrow(copy) {
  if (!copy?.subEyebrow) return copy?.eyebrow || "";
  if (String(copy.eyebrow || "").includes("·")) return copy.eyebrow;
  return `${copy.eyebrow || ""} · ${copy.subEyebrow}`;
}

export function resourcesHeroVisual(copy, navLabel = "", escapeHtml) {
  const eyebrow = combinedEyebrow(copy);
  const mark = eyebrow.replace(/^NEWON\s+/i, "").trim() || navLabel || "RESOURCES";
  const parts = mark
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const top = parts[0];
    const bot = parts.slice(1).join(" · ");
    return `<aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
    <p class="bp-mark bp-mark--stack">
      <span class="bp-mark__line">${escapeHtml(top)}</span>
      <span class="bp-mark__dot"></span>
      <span class="bp-mark__line">${escapeHtml(bot)}</span>
    </p>
  </aside>`;
  }

  const single = parts[0] || navLabel || "RESOURCES";
  return `<aside class="bp-hero__visual bp-hero__visual--mark" aria-hidden="true">
    <p class="bp-mark">${escapeHtml(single)}</p>
  </aside>`;
}

export function resourcesBreadcrumb(copy, currentLabel, opts = {}, escapeHtml) {
  const resourcesHref = opts.resourcesHref || "../";
  const hubLabel = escapeHtml(copy.crumbResources || "RESOURCES");
  const items = [`<li><a href="${resourcesHref}">${hubLabel}</a></li>`];

  if (opts.mid) {
    items.push(`<li><a href="${escapeHtml(opts.midHref || "../")}">${escapeHtml(opts.mid)}</a></li>`);
  }
  items.push(`<li aria-current="page">${escapeHtml(currentLabel)}</li>`);

  return `<nav class="bp-crumb" aria-label="Breadcrumb">
  <div class="bp-inner">
    <ol class="bp-crumb__list">
      ${items.join("\n      ")}
    </ol>
  </div>
</nav>`;
}

export function resourcesHeroBlock(copy, { escapeHtml, brHeadline, ...opts } = {}) {
  const eyebrow = combinedEyebrow(copy);
  const navLabel = copy.navLabel || opts.navLabel || "";
  const primaryHref = copy.ctaPrimaryHref || opts.primaryHref || "#rs-content";
  const secondaryLabel =
    opts.secondaryLabel || copy.ctaSecondary || copy.ctaSecondaryDefault || "";
  const secondaryHref = copy.ctaSecondaryHref || opts.secondaryHref || "../";
  const secondaryExternal = opts.secondaryExternal || copy.ctaSecondaryExternal;

  let actions = "";
  if (copy.ctaPrimary || secondaryLabel) {
    const primary = copy.ctaPrimary
      ? `<a class="bp-btn bp-btn--primary" href="${escapeHtml(primaryHref)}">${escapeHtml(copy.ctaPrimary)}</a>`
      : "";
    const secAttrs = secondaryExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
    const secondary = secondaryLabel
      ? `<a class="bp-btn bp-btn--ghost" href="${escapeHtml(secondaryHref)}"${secAttrs}>${escapeHtml(secondaryLabel)}</a>`
      : "";
    actions = `<div class="bp-hero__actions">${primary}${secondary}</div>`;
  }

  return `<section class="bp-hero" data-rs-reveal aria-labelledby="rs-hero-title">
  <div class="bp-inner bp-hero__grid">
    <div class="bp-hero__copy">
      <p class="bp-eyebrow">${escapeHtml(eyebrow)}</p>
      <h1 class="bp-hero__title" id="rs-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="bp-hero__lead">${brHeadline(copy.lead)}</p>
      ${actions}
    </div>
    ${resourcesHeroVisual(copy, navLabel, escapeHtml)}
  </div>
</section>`;
}
