/**
 * Builds the About page body from copy + live company metrics / product catalog.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getAboutPageCopy } from "./about-page-copy.mjs";
import { getCompanyMetrics } from "./company-metrics.mjs";
import { APP_CATALOG } from "./portfolio-data.mjs";
import { getCompanyProjects } from "./company-portfolio-data.mjs";

const ICON_BY_SLUG = Object.fromEntries(APP_CATALOG.map((a) => [a.slug, a.icon || ""]));
ICON_BY_SLUG["404-human"] = "/404-human-logo.png";

function productHref(project) {
  if (project.slug === "404-human") return `../404-human/`;
  return `../portfolio/${escapeHtml(project.slug)}/`;
}

function productIcon(project) {
  return project.icon || ICON_BY_SLUG[project.slug] || "";
}

function projectsBySlug(lang) {
  const list = getCompanyProjects(lang);
  return Object.fromEntries(list.map((p) => [p.slug, p]));
}

function orderedProducts(copy, bySlug) {
  const order = copy.productOrder || [];
  const seen = new Set();
  const out = [];
  for (const slug of order) {
    if (bySlug[slug]) {
      out.push(bySlug[slug]);
      seen.add(slug);
    }
  }
  for (const p of Object.values(bySlug)) {
    if (!seen.has(p.slug)) out.push(p);
  }
  return out;
}

function logoHtml(slug, name, size = 48) {
  const icon = ICON_BY_SLUG[slug] || (slug === "404-human" ? "/404-human-logo.png" : "");
  if (icon) {
    return `<span class="ab-logo"><img src="${escapeHtml(icon)}" alt="" width="${size}" height="${size}" loading="lazy" decoding="async" /></span>`;
  }
  const mark = String(name || slug || "?")
    .replace(/^Newon\s+/i, "")
    .slice(0, 2)
    .toUpperCase();
  return `<span class="ab-logo ab-logo--mark" aria-hidden="true">${escapeHtml(mark)}</span>`;
}

function metricsHtml(copy, stats) {
  const items = [
    { value: stats.products, label: copy.metricLabels.products },
    { value: stats.countries, label: copy.metricLabels.countries },
    { value: stats.languages, label: copy.metricLabels.languages },
    { value: stats.experiments, label: copy.metricLabels.experiments },
  ];
  return `<section class="ab-metrics" aria-label="Company metrics" data-ab-reveal>
  <div class="ab-inner ab-metrics__grid">
    ${items
      .map(
        (it) => `<div class="ab-metrics__cell">
      <p class="ab-metrics__value" data-ab-count="${escapeHtml(it.value)}">${escapeHtml(it.value)}</p>
      <p class="ab-metrics__label">${escapeHtml(it.label)}</p>
    </div>`
      )
      .join("")}
  </div>
</section>`;
}

function brandHtml(copy) {
  const word = escapeHtml(copy.brandWord || "Newon");
  return `<section class="ab-brand" aria-label="${escapeHtml(copy.brandAria || "Newon")}" data-ab-brand>
  <div class="ab-brand__frame" aria-hidden="true"></div>
  <div class="ab-brand__grain" aria-hidden="true"></div>
  <div class="ab-brand__meta">
    <span class="ab-brand__meta-item">${escapeHtml(copy.brandMetaLeft || "NEWON")}</span>
    <span class="ab-brand__meta-item">${escapeHtml(copy.brandMetaRight || "EST. 2026")}</span>
  </div>
  <div class="ab-brand__stage">
    <p class="ab-brand__kicker">${escapeHtml(copy.brandKicker || "NEW + ON")}</p>
    <div class="ab-brand__rule" aria-hidden="true"></div>
    <div class="ab-brand__mark-wrap" aria-hidden="true">
      <img class="ab-brand__mark" src="/logo.png" alt="" width="120" height="120" decoding="async" />
    </div>
    <p class="ab-brand__word" aria-hidden="true">${word}</p>
    <h1 class="visually-hidden">${word}</h1>
    <div class="ab-brand__rule ab-brand__rule--bottom" aria-hidden="true"></div>
    <p class="ab-brand__line">${escapeHtml(copy.brandLine || "Product & Venture Studio")}</p>
  </div>
  <a class="ab-brand__scroll" href="#ab-about" data-ab-brand-scroll>
    <span class="ab-brand__scroll-label">${escapeHtml(copy.brandScroll || "Scroll")}</span>
    <span class="ab-brand__scroll-icon" aria-hidden="true"><i></i></span>
  </a>
</section>`;
}

function heroHtml(copy) {
  return `<section class="ab-hero" id="ab-about" aria-labelledby="ab-hero-title" data-ab-reveal>
  <div class="ab-inner ab-hero__single">
    <p class="ab-eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
    <h2 id="ab-hero-title" class="ab-hero__title">${copy.heroTitleHtml}</h2>
    <p class="ab-hero__lead">${escapeHtml(copy.heroLead)}</p>
    <p class="ab-hero__sub">${escapeHtml(copy.heroSub)}</p>
    <div class="ab-hero__cta">
      <a class="ab-btn ab-btn--primary" href="../products/">${escapeHtml(copy.ctaProducts)}</a>
      <a class="ab-btn ab-btn--ghost" href="../business/inquiry/">${escapeHtml(copy.ctaBusiness)}</a>
    </div>
  </div>
</section>`;
}

function whyHtml(copy) {
  const body = (copy.whyBody || [])
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const cols = copy.whyNewCols || [];
  const colHtml = (col) =>
    col
      ? `<div class="ab-why__col">
      <p class="ab-why__head">${escapeHtml(col.head)}</p>
      <ul class="ab-why__list">
        ${(col.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>`
      : "";
  return `<section class="ab-section ab-why" aria-labelledby="ab-why-title" data-ab-reveal>
  <div class="ab-inner ab-why__grid">
    <div class="ab-why__copy">
      <p class="ab-eyebrow">${escapeHtml(copy.whyEyebrow)}</p>
      <h2 id="ab-why-title" class="ab-title">${escapeHtml(copy.whyTitle)}</h2>
      <p class="ab-why__tagline">${escapeHtml(copy.whyTagline)}</p>
      <p class="ab-why__tagline-en">${escapeHtml(copy.whyTaglineEn)}</p>
      <div class="ab-why__body">${body}</div>
    </div>
    <div class="ab-why__type" aria-hidden="true">
      <div class="ab-why__type-grid">
        ${colHtml(cols[0])}
        <span class="ab-why__plus">+</span>
        ${colHtml(cols[1])}
      </div>
    </div>
  </div>
</section>`;
}

function glanceHtml(copy) {
  const roles = (copy.glanceRoles || [])
    .map(
      (r) => `<article class="ab-role">
      <span class="ab-role__n">${escapeHtml(r.n)}</span>
      <h3 class="ab-role__title">${escapeHtml(r.title)}</h3>
      <p class="ab-role__body">${escapeHtml(r.body)}</p>
    </article>`
    )
    .join("");
  return `<section class="ab-section ab-section--wash" aria-labelledby="ab-glance-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.glanceEyebrow)}</p>
    <h2 id="ab-glance-title" class="ab-title">${escapeHtml(copy.glanceTitle)}</h2>
    <div class="ab-roles">${roles}</div>
  </div>
</section>`;
}

function universeHtml(copy, products) {
  const cards = products
    .map((p) => {
      const cat = (copy.productCats && copy.productCats[p.slug]) || p.categoryLabel || "";
      const status = p.category === "game" || p.filter === "game" ? copy.statusProject : copy.statusLive;
      const desc = escapeHtml(p.oneLiner || p.summary || "");
      const icon = productIcon(p);
      const logo = icon
        ? `<span class="ab-product__logo"><img src="${escapeHtml(icon)}" alt="" width="72" height="72" loading="lazy" decoding="async" /></span>`
        : `<span class="ab-product__logo ab-product__logo--fallback" aria-hidden="true">${escapeHtml(
            (p.name || "?").slice(0, 1)
          )}</span>`;
      return `<a class="ab-product" href="${productHref(p)}">
        <div class="ab-product__head">
          ${logo}
          <div class="ab-product__top">
            <span class="ab-product__cat">${escapeHtml(cat)}</span>
            <span class="ab-product__status">${escapeHtml(status || "")}</span>
          </div>
        </div>
        <h3 class="ab-product__name">${escapeHtml(p.name)}</h3>
        <p class="ab-product__desc">${desc}</p>
        <span class="ab-product__go">${escapeHtml(copy.universeView || "View →")}</span>
      </a>`;
    })
    .join("");
  return `<section class="ab-section ab-section--wash" aria-labelledby="ab-universe-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.universeEyebrow || "PRODUCT UNIVERSE")}</p>
    <h2 id="ab-universe-title" class="ab-title">${escapeHtml(copy.universeTitle || "")}</h2>
    ${copy.universeLead ? `<p class="ab-lead">${escapeHtml(copy.universeLead)}</p>` : ""}
    <div class="ab-universe">${cards}</div>
    <p class="ab-section__more"><a class="ab-text-link" href="../portfolio/">${escapeHtml(copy.universeAll || "Portfolio →")}</a></p>
  </div>
</section>`;
}

function spacesHtml(copy, bySlug) {
  const cards = (copy.spaces || [])
    .map((sp) => {
      const apps = (sp.slugs || [])
        .map((slug) => {
          const p = bySlug[slug];
          if (!p) return null;
          return { slug, name: p.name, href: productHref(p) };
        })
        .filter(Boolean);
      const logos = apps
        .map(
          (a) => `<a class="ab-space__app" href="${escapeHtml(a.href)}" title="${escapeHtml(a.name)}">
          ${logoHtml(a.slug, a.name, 40)}
          <span class="ab-space__app-name">${escapeHtml(a.name)}</span>
        </a>`
        )
        .join("");
      return `<article class="ab-space">
        <div class="ab-space__meta">
          <span class="ab-space__n">${escapeHtml(sp.n)}</span>
          <span class="ab-space__count">${apps.length ? String(apps.length).padStart(2, "0") : "—"}</span>
        </div>
        <h3 class="ab-space__title">${escapeHtml(sp.title)}</h3>
        <p class="ab-space__body">${escapeHtml(sp.body)}</p>
        ${logos ? `<div class="ab-space__apps">${logos}</div>` : ""}
      </article>`;
    })
    .join("");
  if (!cards) return "";
  return `<section class="ab-section" aria-labelledby="ab-spaces-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.spacesEyebrow || "PROBLEM SPACES")}</p>
    <h2 id="ab-spaces-title" class="ab-title">${escapeHtml(copy.spacesTitle || "")}</h2>
    <div class="ab-spaces">${cards}</div>
  </div>
</section>`;
}

function buildHtml(copy) {
  const cards = (copy.buildAreas || [])
    .map(
      (a) => `<a class="ab-build__card" href="${escapeHtml(a.href)}">
      <span class="ab-build__n">${escapeHtml(a.n)}</span>
      <h3 class="ab-build__title">${escapeHtml(a.title)}</h3>
      <p class="ab-build__body">${escapeHtml(a.body)}</p>
      <span class="ab-build__go" aria-hidden="true">↗</span>
    </a>`
    )
    .join("");
  return `<section class="ab-section" aria-labelledby="ab-build-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.buildEyebrow)}</p>
    <h2 id="ab-build-title" class="ab-title ab-title--wide">${escapeHtml(copy.buildTitle)}</h2>
    <div class="ab-build">${cards}</div>
  </div>
</section>`;
}

function workHtml(copy) {
  const steps = (copy.workSteps || [])
    .map(
      (s) => `<li class="ab-work__step">
      <span class="ab-work__n">${escapeHtml(s.n)}</span>
      <h3 class="ab-work__title">${escapeHtml(s.title)}</h3>
      <p class="ab-work__body">${escapeHtml(s.body)}</p>
    </li>`
    )
    .join("");
  return `<section class="ab-section ab-section--ink ab-work" aria-labelledby="ab-work-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow ab-eyebrow--on-ink">${escapeHtml(copy.workEyebrow)}</p>
    <h2 id="ab-work-title" class="ab-title ab-title--on-ink">${escapeHtml(copy.workTitle)}</h2>
    <ol class="ab-work__rail">${steps}</ol>
  </div>
</section>`;
}

function principlesHtml(copy) {
  const items = (copy.principles || [])
    .map(
      (p, i) => `<article class="ab-principle${i === 0 ? " is-active" : ""}" data-ab-principle>
      <span class="ab-principle__n">${escapeHtml(p.n)}</span>
      <div class="ab-principle__copy">
        <h3 class="ab-principle__title">${escapeHtml(p.title)}</h3>
        <p class="ab-principle__body">${escapeHtml(p.body)}</p>
      </div>
    </article>`
    )
    .join("");
  return `<section class="ab-section ab-principles" aria-labelledby="ab-principles-title" data-ab-reveal>
  <div class="ab-inner ab-principles__grid">
    <div class="ab-principles__sticky">
      <p class="ab-eyebrow">${escapeHtml(copy.principlesEyebrow)}</p>
      <h2 id="ab-principles-title" class="ab-title">${escapeHtml(copy.principlesTitle)}</h2>
    </div>
    <div class="ab-principles__list" data-ab-principles>${items}</div>
  </div>
</section>`;
}

function ecosystemHtml(copy) {
  const items = (copy.ecosystemItems || [])
    .map(
      (item) => `<a class="ab-eco__item" href="${escapeHtml(item.href)}">
      <span class="ab-eco__label">${escapeHtml(item.title)}</span>
      <span class="ab-eco__body">${escapeHtml(item.body)}</span>
      <span class="ab-eco__go" aria-hidden="true">↗</span>
    </a>`
    )
    .join("");
  return `<section class="ab-section ab-section--wash ab-eco" aria-labelledby="ab-eco-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.ecosystemEyebrow)}</p>
    <h2 id="ab-eco-title" class="ab-title">${escapeHtml(copy.ecosystemTitle)}</h2>
    <div class="ab-eco">
      <p class="ab-eco__hub" aria-hidden="true">${escapeHtml(copy.ecosystemHub)}</p>
      <div class="ab-eco__grid">${items}</div>
    </div>
  </div>
</section>`;
}

function journeyHtml(copy) {
  const steps = (copy.journeyMilestones || [])
    .map(
      (m, i, arr) => `<li class="ab-journey__step${m.isNow ? " is-now" : ""}">
      <div class="ab-journey__marker">
        <span class="ab-journey__year">${escapeHtml(m.year)}</span>
        ${i < arr.length - 1 ? `<span class="ab-journey__line" aria-hidden="true"></span>` : ""}
      </div>
      <div class="ab-journey__copy">
        <h3 class="ab-journey__title">${escapeHtml(m.title)}</h3>
        <p class="ab-journey__body">${escapeHtml(m.body)}</p>
      </div>
    </li>`
    )
    .join("");
  return `<section class="ab-section ab-journey" aria-labelledby="ab-journey-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.journeyEyebrow)}</p>
    <h2 id="ab-journey-title" class="ab-title">${escapeHtml(copy.journeyTitle)}</h2>
    ${copy.journeyNote ? `<p class="ab-lead">${escapeHtml(copy.journeyNote)}</p>` : ""}
    <ol class="ab-journey__rail">${steps}</ol>
  </div>
</section>`;
}

function founderHtml(copy) {
  return `<section class="ab-section ab-founder" aria-labelledby="ab-founder-title" data-ab-reveal>
  <div class="ab-inner ab-founder__grid">
    <div>
      <p class="ab-eyebrow">${escapeHtml(copy.founderEyebrow)}</p>
      <h2 id="ab-founder-title" class="ab-title ab-title--wide">${escapeHtml(copy.founderRole)}</h2>
    </div>
    <p class="ab-founder__body">${escapeHtml(copy.founderBody)}</p>
  </div>
</section>`;
}

function exploreHtml(copy) {
  const strip = ["ox-month", "goalup", "savy", "babylog"]
    .map((slug) => logoHtml(slug, slug, 36))
    .join("");
  const panels = (copy.explorePanels || [])
    .map((p, i) => {
      const logos = i === 0 ? `<div class="ab-explore__logos">${strip}</div>` : "";
      return `<a class="ab-explore__panel${p.invert ? " ab-explore__panel--invert" : ""}" href="${escapeHtml(p.href)}">
      <div class="ab-explore__top">
        <span class="ab-explore__n">${escapeHtml(p.n)}</span>
        ${logos}
      </div>
      <h3 class="ab-explore__title">${escapeHtml(p.title)}</h3>
      <p class="ab-explore__body">${escapeHtml(p.body)}</p>
      <span class="ab-explore__go">${escapeHtml(p.cta)}</span>
    </a>`;
    })
    .join("");
  return `<section class="ab-section" aria-labelledby="ab-explore-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.exploreEyebrow)}</p>
    <h2 id="ab-explore-title" class="ab-title">${escapeHtml(copy.exploreTitle)}</h2>
    <div class="ab-explore ab-explore--six">${panels}</div>
  </div>
</section>`;
}

function ideaHtml(copy) {
  return `<section class="ab-section ab-idea" aria-labelledby="ab-idea-title" data-ab-reveal>
  <div class="ab-inner ab-idea__grid">
    <div>
      <p class="ab-eyebrow">${escapeHtml(copy.ideaEyebrow)}</p>
      <h2 id="ab-idea-title" class="ab-title">${copy.ideaTitleHtml}</h2>
    </div>
    <div class="ab-idea__side">
      <p class="ab-lead">${escapeHtml(copy.ideaLead)}</p>
      <a class="ab-btn ab-btn--primary" href="../ideas/">${escapeHtml(copy.ideaCta)}</a>
      <p class="ab-idea__hint">${escapeHtml(copy.ideaHint)}</p>
    </div>
  </div>
</section>`;
}

function closeHtml(copy) {
  return `<section class="ab-section ab-section--ink ab-close" aria-labelledby="ab-close-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow ab-eyebrow--on-ink">${escapeHtml(copy.closeEyebrow)}</p>
    <h2 id="ab-close-title" class="ab-title ab-title--on-ink">${copy.closeTitleHtml}</h2>
    <p class="ab-lead ab-lead--on-ink">${escapeHtml(copy.closeLead)}</p>
    ${copy.closeTaglineEn ? `<p class="ab-close__en">${escapeHtml(copy.closeTaglineEn)}</p>` : ""}
    <div class="ab-close__cta">
      <a class="ab-btn ab-btn--on-ink" href="../products/">${escapeHtml(copy.closeProducts)}</a>
      <a class="ab-btn ab-btn--ghost-on-ink" href="../business/inquiry/">${escapeHtml(copy.closeBusiness)}</a>
      <a class="ab-btn ab-btn--ghost-on-ink ab-btn--tertiary" href="../ideas/">${escapeHtml(copy.closeIdeas)}</a>
    </div>
  </div>
</section>`;
}

/**
 * @param {string} lang - "ko" | "en" (other locales use EN copy)
 */
export function buildAboutPageBody(lang) {
  const copyLang = lang === "ko" ? "ko" : "en";
  const copy = getAboutPageCopy(copyLang);
  const stats = getCompanyMetrics();
  const bySlug = projectsBySlug(copyLang);
  const products = orderedProducts(copy, bySlug);

  return `${brandHtml(copy)}
${heroHtml(copy)}
${whyHtml(copy)}
${glanceHtml(copy)}
${universeHtml(copy, products)}
${spacesHtml(copy, bySlug)}
${buildHtml(copy)}
${workHtml(copy)}
${principlesHtml(copy)}
${ecosystemHtml(copy)}
${metricsHtml(copy, stats)}
${journeyHtml(copy)}
${founderHtml(copy)}
${exploreHtml(copy)}
${ideaHtml(copy)}
${closeHtml(copy)}`;
}

export function getAboutSeo(lang) {
  const copy = getAboutPageCopy(lang === "ko" ? "ko" : "en");
  return { seoTitle: copy.seoTitle, metaDescription: copy.metaDescription };
}
