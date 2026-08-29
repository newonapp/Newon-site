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

const HOME_HASH_BY_SLUG = Object.fromEntries(
  APP_CATALOG.filter((a) => a.homeHash).map((a) => [a.slug, a.homeHash])
);

function productHref(project) {
  if (project.slug === "404-human") return `../404-human/`;
  const hash = HOME_HASH_BY_SLUG[project.slug] || project.homeHash;
  if (hash) {
    // App intro sections live on the locale home page (#ox-month, #goalup-app, …)
    if (hash.endsWith("/")) return `../${hash.replace(/^\//, "")}`;
    return `../${hash.startsWith("#") ? hash : `#${hash}`}`;
  }
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
    { value: stats.apps, label: copy.metricLabels.apps },
    { value: stats.products, label: copy.metricLabels.products },
    { value: stats.countries, label: copy.metricLabels.countries },
    { value: stats.languages, label: copy.metricLabels.languages },
  ];
  return `<section class="ab-metrics" id="ab-metrics" aria-label="Company metrics" data-ab-reveal>
  <div class="ab-inner ab-metrics__grid">
    ${items
      .map(
        (it, i) => `<div class="ab-metrics__cell">
      <span class="ab-metrics__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <p class="ab-metrics__value" data-ab-count="${escapeHtml(it.value)}">${escapeHtml(it.value)}</p>
      <p class="ab-metrics__label">${escapeHtml(it.label)}</p>
    </div>`
      )
      .join("")}
  </div>
</section>`;
}

function brandHtml(copy, stats = {}) {
  const word = escapeHtml(copy.brandWord || "Newon");
  const cardAria = escapeHtml(copy.cardAria || "Newon digital card");
  const cardAlt = escapeHtml(copy.cardAlt || "Newon business card");
  const cardHint = escapeHtml(copy.cardHint || "");
  const domains = Array.isArray(copy.brandDomains) ? copy.brandDomains : [];
  const domainList = domains.length
    ? `<ul class="ab-brand__domains" aria-label="${escapeHtml(copy.brandDomainsAria || "What we build")}">${domains
        .map((d) => `<li>${escapeHtml(d)}</li>`)
        .join("")}</ul>`
    : "";
  const crumb = copy.brandCrumb || "Company / ABOUT";
  const crumbParts = String(crumb).split(/\s*\/\s*/);
  const metaL = escapeHtml(copy.brandMetaLeft || "NEWON");
  const metaR = escapeHtml(copy.brandMetaRight || "EST. 2026");
  const kicker = escapeHtml(copy.brandKicker || "NEW + ON");
  const meaning = escapeHtml(copy.brandMeaning || "");

  return `<header class="ab-brand ab-brand--hq ab-brand--intro" id="ab-about" aria-label="${escapeHtml(copy.brandAria || "Newon")}" data-ab-brand>
  <div class="ab-inner">
    <nav class="ab-brand__crumb" aria-label="Breadcrumb">
      <a href="./">${escapeHtml(crumbParts[0] || "Company")}</a>
      <span class="ab-brand__crumb-sep" aria-hidden="true">/</span>
      <span>${escapeHtml(crumbParts[1] || "ABOUT")}</span>
    </nav>
    <div class="ab-brand__layout">
      <div class="ab-brand__primary">
        <p class="ab-brand__eyebrow">${escapeHtml(copy.heroEyebrow || "ABOUT NEWON")}<span class="ab-brand__eyebrow-sep" aria-hidden="true">·</span><span class="ab-brand__eyebrow-role">${escapeHtml(copy.brandLine || "Product & Venture Studio")}</span></p>
        <p class="ab-brand__word" aria-hidden="true">${word}</p>
        <h1 class="ab-brand__headline">${copy.heroTitleHtml}</h1>
        <p class="ab-brand__lead">${copy.heroLeadHtml || escapeHtml(copy.heroLead || "")}</p>
        ${domainList}
        ${meaning ? `<p class="ab-brand__meaning"><span class="ab-brand__meaning-k">${kicker}</span><span class="ab-brand__meaning-t">${meaning}</span></p>` : ""}
        <div class="ab-brand__cta">
          <a class="ab-btn ab-btn--primary" href="../products/">${escapeHtml(copy.ctaProducts)}</a>
          <a class="ab-btn ab-btn--ghost" href="../business/inquiry/">${escapeHtml(copy.ctaBusiness)}</a>
        </div>
      </div>
      <aside class="ab-brand__visual" aria-label="${cardAria}">
        <div class="ab-sv" data-ab-sv>
          <div class="ab-sv__head">
            <span class="ab-sv__live" aria-hidden="true"><i></i> DIGITAL CARD</span>
            <span class="ab-sv__meta">${metaL}</span>
          </div>
          <div class="ab-sv__body">
            <a class="ab-ncard ab-ncard--front" href="/card-n7x4k9/" aria-label="${cardAria}">
              <img src="/card-n7x4k9/newon-card-back.jpg" alt="${cardAlt}" width="1024" height="588" decoding="async" fetchpriority="high" />
            </a>
            ${cardHint ? `<p class="ab-brand__card-hint">${cardHint}</p>` : ""}
          </div>
          <div class="ab-sv__foot" aria-hidden="true">
            <span>${metaL}</span>
            <span>${metaR}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</header>`;
}

function heroHtml(copy) {
  const nameAria = copy.heroNameAria || "New + On";
  return `<section class="ab-hero" id="ab-about" aria-labelledby="ab-hero-title" data-ab-reveal>
  <div class="ab-inner ab-hero__grid">
    <div class="ab-hero__main">
      <p class="ab-eyebrow ab-eyebrow--rule">${escapeHtml(copy.heroEyebrow)}</p>
      <h2 id="ab-hero-title" class="ab-hero__title">${copy.heroTitleHtml}</h2>
      <p class="ab-hero__lead">${copy.heroLeadHtml || escapeHtml(copy.heroLead || "")}</p>
      <div class="ab-hero__cta">
        <a class="ab-btn ab-btn--primary" href="../products/">${escapeHtml(copy.ctaProducts)}</a>
        <a class="ab-btn ab-btn--ghost" href="../business/inquiry/">${escapeHtml(copy.ctaBusiness)}</a>
      </div>
    </div>
    <aside class="ab-hero__name" aria-label="${escapeHtml(nameAria)}">
      <div class="ab-hero__name-panel">
        <p class="ab-hero__name-kicker">${escapeHtml(copy.heroNameKicker || "NEW + ON")}</p>
        <div class="ab-hero__name-stack">
          <div class="ab-hero__name-block">
            <p class="ab-hero__name-label">${escapeHtml(copy.heroNameNew || "NEW")}</p>
            <p class="ab-hero__name-desc">${escapeHtml(copy.heroNameNewDesc || "")}</p>
          </div>
          <span class="ab-hero__name-plus" aria-hidden="true">+</span>
          <div class="ab-hero__name-block ab-hero__name-block--on">
            <p class="ab-hero__name-label">${escapeHtml(copy.heroNameOn || "ON")}</p>
            <p class="ab-hero__name-desc">${escapeHtml(copy.heroNameOnDesc || "")}</p>
          </div>
        </div>
        ${copy.heroNameNote ? `<p class="ab-hero__name-note">${escapeHtml(copy.heroNameNote)}</p>` : ""}
      </div>
    </aside>
  </div>
</section>`;
}

function whyHtml(copy) {
  const body = (copy.whyBody || [])
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
  const cols = copy.whyNewCols || [];
  const typeBlock =
    cols.length >= 2
      ? `<div class="ab-why__type" aria-hidden="true">
      <div class="ab-why__type-grid">
        <div class="ab-why__col">
          <p class="ab-why__head">${escapeHtml(cols[0].head)}</p>
          <ul class="ab-why__list">${(cols[0].items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <span class="ab-why__plus">+</span>
        <div class="ab-why__col">
          <p class="ab-why__head">${escapeHtml(cols[1].head)}</p>
          <ul class="ab-why__list">${(cols[1].items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
    </div>`
      : "";
  return `<section class="ab-section ab-why" aria-labelledby="ab-why-title" data-ab-reveal>
  <div class="ab-inner ab-why__grid${typeBlock ? "" : " ab-why__grid--solo"}">
    <div class="ab-why__copy">
      <p class="ab-eyebrow">${escapeHtml(copy.whyEyebrow)}</p>
      <h2 id="ab-why-title" class="ab-title">${escapeHtml(copy.whyTitle)}</h2>
      ${copy.whyTagline ? `<p class="ab-why__tagline">${escapeHtml(copy.whyTagline)}</p>` : ""}
      ${copy.whyTaglineEn ? `<p class="ab-why__tagline-en">${escapeHtml(copy.whyTaglineEn)}</p>` : ""}
      <div class="ab-why__body">${body}</div>
    </div>
    ${typeBlock}
  </div>
</section>`;
}

function productAreasHtml(copy) {
  const areas = copy.productAreas || [];
  if (!areas.length) return "";
  const chips = areas
    .map((a, i) => `<span class="ab-areas__chip" style="--i:${i}">${escapeHtml(a)}</span>`)
    .join('<span class="ab-areas__dot" aria-hidden="true">·</span>');
  return `<section class="ab-section ab-product-areas" aria-labelledby="ab-areas-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.productAreasEyebrow || "PRODUCT AREAS")}</p>
    <h2 id="ab-areas-title" class="visually-hidden">${escapeHtml(copy.productAreasEyebrow || "Product areas")}</h2>
    <div class="ab-areas__rail">${chips}</div>
  </div>
</section>`;
}

function missionHtml(copy) {
  if (!copy.missionTitle) return "";
  const points = (copy.missionPoints || [])
    .map(
      (p, i) => `<article class="ab-mission__card">
      <span class="ab-mission__n">${escapeHtml(p.n)}</span>
      <h3 class="ab-mission__card-title">${escapeHtml(p.title)}</h3>
      <p class="ab-mission__card-body">${escapeHtml(p.body)}</p>
    </article>`
    )
    .join("");
  return `<section class="ab-section ab-mission" aria-labelledby="ab-mission-title" data-ab-reveal>
  <div class="ab-inner ab-mission__layout">
    <header class="ab-mission__intro">
      <p class="ab-eyebrow">${escapeHtml(copy.missionEyebrow || "MISSION")}</p>
      <h2 id="ab-mission-title" class="ab-title ab-title--wide">${escapeHtml(copy.missionTitle)}</h2>
      ${copy.missionLead ? `<p class="ab-lead">${escapeHtml(copy.missionLead)}</p>` : ""}
    </header>
    <div class="ab-mission__grid">${points}</div>
  </div>
</section>`;
}

function glanceHtml(copy) {
  const roles = copy.glanceRoles || [];
  if (!roles.length) return "";

  const personCard = (r, i) => {
    const tags = (r.tags || [])
      .map((t) => `<li>${escapeHtml(t)}</li>`)
      .join("");
    const via = r.via
      ? `<span class="ab-person__via">${escapeHtml(r.via)}</span>`
      : "";
    const tagList = tags
      ? `<ul class="ab-person__tags" aria-label="Focus">${tags}</ul>`
      : "";
    return `<article class="ab-person ab-person--paper">
      <div class="ab-person__meta">
        <span class="ab-person__n">${escapeHtml(r.n || String(i + 1).padStart(2, "0"))}</span>
        ${via}
      </div>
      <h3 class="ab-person__title">${escapeHtml(r.title)}</h3>
      <p class="ab-person__body">${escapeHtml(r.body)}</p>
      ${tagList}
    </article>`;
  };

  const cards = roles.map((r, i) => personCard(r, i)).join("");
  const lead = copy.glanceLead
    ? `<p class="ab-glance__lead">${escapeHtml(copy.glanceLead)}</p>`
    : "";

  return `<section class="ab-section ab-glance ab-glance--hq" aria-labelledby="ab-glance-title" data-ab-reveal>
  <div class="ab-inner">
    <header class="ab-glance__head">
      <div class="ab-glance__head-main">
        <p class="ab-eyebrow">${escapeHtml(copy.glanceEyebrow)}</p>
        <h2 id="ab-glance-title" class="ab-title">${escapeHtml(copy.glanceTitle)}</h2>
      </div>
      ${lead}
    </header>
    <div class="ab-glance__stage">${cards}</div>
  </div>
</section>`;
}

function studioNoteHtml(copy) {
  if (!copy.studioNoteTitle) return "";
  return `<section class="ab-section ab-studio-note" aria-labelledby="ab-studio-note-title" data-ab-reveal>
  <div class="ab-inner ab-studio-note__grid">
    <div class="ab-studio-note__intro">
      <p class="ab-eyebrow">${escapeHtml(copy.studioNoteEyebrow || "STUDIO NOTE")}</p>
      <h2 id="ab-studio-note-title" class="ab-title ab-title--wide">${escapeHtml(copy.studioNoteTitle)}</h2>
    </div>
    <p class="ab-studio-note__body">${escapeHtml(copy.studioNoteBody || "")}</p>
  </div>
</section>`;
}

function selectedProductsHtml(copy, products) {
  const max = copy.selectedProductsMax || 8;
  const cards = products.slice(0, max)
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
  return `<section class="ab-section ab-selected" aria-labelledby="ab-selected-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.selectedEyebrow || "SELECTED PRODUCTS")}</p>
    <h2 id="ab-selected-title" class="ab-title">${escapeHtml(copy.selectedTitle || "")}</h2>
    ${copy.selectedLead ? `<p class="ab-lead">${escapeHtml(copy.selectedLead)}</p>` : ""}
    <div class="ab-universe">${cards}</div>
    <p class="ab-section__more"><a class="ab-text-link" href="../products/">${escapeHtml(copy.selectedAll || "VIEW ALL PRODUCTS →")}</a></p>
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
    .map((a, i) => {
      const raw = String(a.body || "");
      const parts = raw.split(/\.\s+/);
      const lead = parts.length > 1 ? `${parts[0]}.` : raw;
      const tagsRaw = parts.length > 1 ? parts.slice(1).join(". ") : "";
      const tags = tagsRaw
        .split(/\s*[·•|]\s*/)
        .map((t) => t.trim())
        .filter(Boolean);
      const tagList = tags.length
        ? `<ul class="ab-build__tags" aria-hidden="true">${tags
            .map((t) => `<li>${escapeHtml(t)}</li>`)
            .join("")}</ul>`
        : "";
      return `<a class="ab-build__card" href="${escapeHtml(a.href)}" style="--ab-i:${i}">
      <div class="ab-build__top">
        <span class="ab-build__n">${escapeHtml(a.n)}</span>
        <span class="ab-build__go" aria-hidden="true">↗</span>
      </div>
      <h3 class="ab-build__title">${escapeHtml(a.title)}</h3>
      <p class="ab-build__body">${escapeHtml(lead)}</p>
      ${tagList}
    </a>`;
    })
    .join("");
  return `<section class="ab-section ab-build-sec ab-build-sec--hq" aria-labelledby="ab-build-title" data-ab-reveal>
  <div class="ab-inner">
    <header class="ab-build-sec__intro">
      <div class="ab-build-sec__kicker">
        <p class="ab-eyebrow">${escapeHtml(copy.buildEyebrow)}</p>
        <span class="ab-build-sec__meta" aria-hidden="true">Studio · 4</span>
      </div>
      <h2 id="ab-build-title" class="ab-title ab-title--wide">${escapeHtml(copy.buildTitle)}</h2>
    </header>
    <div class="ab-build-board">
      <div class="ab-build-board__head" aria-hidden="true">
        <span class="ab-build-board__live"><i></i> AREAS</span>
        <span>PRODUCTS · BUSINESS · STUDIO · LABS</span>
      </div>
      <div class="ab-build">${cards}</div>
    </div>
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
      (p, i) => `<article class="ab-principle ab-principle--tile" data-ab-principle style="--ab-i:${i}">
      <span class="ab-principle__n">${escapeHtml(p.n)}</span>
      <div class="ab-principle__copy">
        <h3 class="ab-principle__title">${escapeHtml(p.title)}</h3>
        <p class="ab-principle__body">${escapeHtml(p.body)}</p>
      </div>
      <span class="ab-principle__mark" aria-hidden="true"></span>
    </article>`
    )
    .join("");
  return `<section class="ab-section ab-principles ab-principles--hq" aria-labelledby="ab-principles-title" data-ab-reveal>
  <div class="ab-inner">
    <header class="ab-principles__head">
      <p class="ab-eyebrow">${escapeHtml(copy.principlesEyebrow)}</p>
      <h2 id="ab-principles-title" class="ab-title">${escapeHtml(copy.principlesTitle)}</h2>
    </header>
    <div class="ab-principles__mosaic" data-ab-principles>${items}</div>
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
      (m, i, arr) => `<li class="ab-journey__step${m.isNow ? " is-now" : ""}" style="--ab-i:${i}">
      <div class="ab-journey__marker">
        <span class="ab-journey__idx" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
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
  return `<section class="ab-section ab-journey ab-journey--hq" aria-labelledby="ab-journey-title" data-ab-reveal>
  <div class="ab-inner">
    <header class="ab-journey__head">
      <div class="ab-journey__kicker">
        <p class="ab-eyebrow">${escapeHtml(copy.journeyEyebrow)}</p>
        <span class="ab-journey__meta" aria-hidden="true">01 → 04</span>
      </div>
      <div class="ab-journey__head-row">
        <h2 id="ab-journey-title" class="ab-title">${escapeHtml(copy.journeyTitle)}</h2>
        ${copy.journeyNote ? `<p class="ab-lead ab-journey__note">${escapeHtml(copy.journeyNote)}</p>` : ""}
      </div>
    </header>
    <div class="ab-journey__board">
      <div class="ab-journey__board-head" aria-hidden="true">
        <span class="ab-journey__board-live"><i></i> PATH</span>
        <span>START · BUILD · EXPAND · NEXT</span>
      </div>
      <ol class="ab-journey__rail">${steps}</ol>
    </div>
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
  const strip = ["ox-month", "goalup", "savy", "babylog", "petlog", "pillmate", "countup", "subping", "piggyup", "myworld", "newon-plus"]
    .map((slug) => logoHtml(slug, slug, 36))
    .join("");
  const panels = (copy.explorePanels || [])
    .map((p, i) => {
      const logos = i === 0 ? `<div class="ab-explore__logos">${strip}</div>` : "";
      return `<a class="ab-explore__panel" href="${escapeHtml(p.href)}">
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
    <div class="ab-explore">${panels}</div>
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
      ${copy.closePortfolio ? `<a class="ab-btn ab-btn--ghost-on-ink ab-btn--tertiary" href="../portfolio/">${escapeHtml(copy.closePortfolio)}</a>` : ""}
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

  return `${brandHtml(copy, stats)}
${metricsHtml(copy, stats)}
${whyHtml(copy)}
${missionHtml(copy)}
${buildHtml(copy)}
${glanceHtml(copy)}
${spacesHtml(copy, bySlug)}
${productAreasHtml(copy)}
${workHtml(copy)}
${principlesHtml(copy)}
${journeyHtml(copy)}
${studioNoteHtml(copy)}
${selectedProductsHtml(copy, products)}
${exploreHtml(copy)}
${ideaHtml(copy)}
${closeHtml(copy)}`;
}

export function getAboutSeo(lang) {
  const copy = getAboutPageCopy(lang === "ko" ? "ko" : "en");
  return {
    seoTitle: copy.seoTitle,
    metaDescription: copy.metaDescription,
    metaKeywords: copy.metaKeywords || "",
  };
}
