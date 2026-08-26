/**
 * Builds the redesigned About page body from copy + live catalog / news / labs data.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getAboutPageCopy } from "./about-page-copy.mjs";
import { APP_CATALOG, PORTFOLIO_STATS, visibleStats } from "./portfolio-data.mjs";
import { getCompanyProjects } from "./company-portfolio-data.mjs";
import { getLabsExperiments } from "./lab-experiments.mjs";
import {
  publishedArticles,
  articleCopy,
  formatNewsDate,
  productBySlug,
  articleProductSlug,
  buildTimelineEntries,
  formatHistoryDisplayDate,
  historyDatetimeAttr,
} from "./news-data.mjs";

const HOME_HASH_BY_SLUG = Object.fromEntries(
  APP_CATALOG.map((a) => [a.slug, a.homeHash || ""])
);
const ICON_BY_SLUG = Object.fromEntries(APP_CATALOG.map((a) => [a.slug, a.icon || ""]));
ICON_BY_SLUG["404-human"] = "/404-human-logo.png";

function productHref(project, langDir) {
  if (project.slug === "404-human") {
    return `../404-human/`;
  }
  // Dedicated app intro pages — no home shell flash
  return `../portfolio/${escapeHtml(project.slug)}/`;
}

function productIcon(project) {
  return project.icon || ICON_BY_SLUG[project.slug] || "";
}

function companyStats() {
  const stats = visibleStats(PORTFOLIO_STATS);
  const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
  return {
    products: String(APP_CATALOG.length),
    languages: String(byId.languages?.value || "13"),
    countries: String(byId.countries?.value || "177"),
    founded: "2026",
  };
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

function metricsHtml(copy, stats) {
  const items = [
    { value: stats.products, label: copy.metricLabels.products },
    { value: stats.languages, label: copy.metricLabels.languages },
    { value: stats.countries, label: copy.metricLabels.countries },
    { value: stats.founded, label: copy.metricLabels.founded },
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

function heroHtml(copy) {
  const indexRows = (copy.indexItems || [])
    .map(
      (it) => `<li class="ab-index__row">
      <span class="ab-index__n">${escapeHtml(it.n)}</span>
      <span class="ab-index__label">${escapeHtml(it.label)}</span>
    </li>`
    )
    .join("");
  const meta = (copy.indexMeta || [])
    .map((m) => `<span>${escapeHtml(m)}</span>`)
    .join('<span class="ab-index__dot" aria-hidden="true">·</span>');

  return `<section class="ab-hero" aria-labelledby="ab-hero-title" data-ab-reveal>
  <div class="ab-inner ab-hero__grid">
    <div class="ab-hero__copy">
      <p class="ab-eyebrow">${escapeHtml(copy.heroEyebrow)}</p>
      <h1 id="ab-hero-title" class="ab-hero__title">${copy.heroTitleHtml}</h1>
      <p class="ab-hero__lead">${escapeHtml(copy.heroLead)}</p>
      <p class="ab-hero__sub">${escapeHtml(copy.heroSub)}</p>
      <div class="ab-hero__cta">
        <a class="ab-btn ab-btn--primary" href="../portfolio/">${escapeHtml(copy.ctaProducts)}</a>
        <a class="ab-btn ab-btn--ghost" href="../business/">${escapeHtml(copy.ctaBusiness)}</a>
      </div>
    </div>
    <aside class="ab-index" aria-label="${escapeHtml(copy.indexTitle)}">
      <p class="ab-index__title">${escapeHtml(copy.indexTitle)}</p>
      <ol class="ab-index__list">${indexRows}</ol>
      <p class="ab-index__meta">${meta}</p>
    </aside>
  </div>
</section>`;
}

function glanceHtml(copy) {
  const facts = (copy.glanceFacts || [])
    .map(
      (f) => `<div class="ab-glance__fact">
      <dt>${escapeHtml(f.k)}</dt>
      <dd>${escapeHtml(f.v)}</dd>
    </div>`
    )
    .join("");
  return `<section class="ab-section ab-section--wash" aria-labelledby="ab-glance-title" data-ab-reveal>
  <div class="ab-inner ab-glance">
    <div class="ab-glance__copy">
      <p class="ab-eyebrow">${escapeHtml(copy.glanceEyebrow)}</p>
      <h2 id="ab-glance-title" class="ab-title">${escapeHtml(copy.glanceTitle)}</h2>
      <p class="ab-lead">${escapeHtml(copy.glanceLead)}</p>
    </div>
    <dl class="ab-glance__facts">${facts}</dl>
  </div>
</section>`;
}

function doHtml(copy) {
  const areas = copy.doAreas || [];
  const featured = areas.find((a) => a.featured) || areas[0];
  const rest = areas.filter((a) => a !== featured);
  const feat = featured
    ? `<article class="ab-do__feature">
      <span class="ab-do__n">${escapeHtml(featured.n)}</span>
      <h3 class="ab-do__title">${escapeHtml(featured.title)}</h3>
      <p class="ab-do__body">${escapeHtml(featured.body)}</p>
    </article>`
    : "";
  const grid = rest
    .map(
      (a) => `<article class="ab-do__card">
      <span class="ab-do__n">${escapeHtml(a.n)}</span>
      <h3 class="ab-do__title">${escapeHtml(a.title)}</h3>
      <p class="ab-do__body">${escapeHtml(a.body)}</p>
    </article>`
    )
    .join("");
  return `<section class="ab-section" aria-labelledby="ab-do-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.doEyebrow)}</p>
    <h2 id="ab-do-title" class="ab-title ab-title--wide">${escapeHtml(copy.doTitle)}</h2>
    <div class="ab-do">
      ${feat}
      <div class="ab-do__grid">${grid}</div>
    </div>
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

function universeHtml(copy, products, langDir) {
  const cards = products
    .map((p) => {
      const cat = copy.productCats[p.slug] || p.categoryLabel || "";
      const status = p.category === "game" ? copy.statusProject : copy.statusLive;
      const desc = escapeHtml(p.oneLiner || p.summary || "");
      const icon = productIcon(p);
      const logo = icon
        ? `<span class="ab-product__logo"><img src="${escapeHtml(icon)}" alt="" width="88" height="88" loading="lazy" decoding="async" /></span>`
        : `<span class="ab-product__logo ab-product__logo--fallback" aria-hidden="true">${escapeHtml(
            (p.name || "?").slice(0, 1)
          )}</span>`;
      return `<a class="ab-product" href="${productHref(p, langDir)}">
        <div class="ab-product__head">
          ${logo}
          <div class="ab-product__top">
            <span class="ab-product__cat">${escapeHtml(cat)}</span>
            <span class="ab-product__status">${escapeHtml(status)}</span>
          </div>
        </div>
        <h3 class="ab-product__name">${escapeHtml(p.name)}</h3>
        <p class="ab-product__desc">${desc}</p>
        <span class="ab-product__go">${escapeHtml(copy.universeView)}</span>
      </a>`;
    })
    .join("");
  return `<section class="ab-section ab-section--wash" aria-labelledby="ab-universe-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.universeEyebrow)}</p>
    <h2 id="ab-universe-title" class="ab-title">${escapeHtml(copy.universeTitle)}</h2>
    <p class="ab-lead">${escapeHtml(copy.universeLead)}</p>
    <div class="ab-universe">${cards}</div>
    <p class="ab-section__more"><a class="ab-text-link" href="../portfolio/">${escapeHtml(copy.universeAll)}</a></p>
  </div>
</section>`;
}

function appIntroHref(slug, langDir) {
  if (!slug) return "../portfolio/";
  if (slug === "404-human") return `../404-human/`;
  // Dedicated portfolio intro — skip home hash router flash
  if (HOME_HASH_BY_SLUG[slug] || ICON_BY_SLUG[slug]) {
    return `../portfolio/${escapeHtml(slug)}/`;
  }
  return `../portfolio/${escapeHtml(slug)}/`;
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

function loopHtml(copy) {
  const steps = copy.loopSteps || [];
  const cells = steps
    .map(
      (s, i) => `<li class="ab-loop__step">
      <span class="ab-loop__n">${escapeHtml(s.n)}</span>
      <h3 class="ab-loop__title">${escapeHtml(s.title)}</h3>
      <p class="ab-loop__body">${escapeHtml(s.body)}</p>
      ${i < steps.length - 1 ? `<span class="ab-loop__connector" aria-hidden="true"></span>` : ""}
    </li>`
    )
    .join("");
  return `<section class="ab-section ab-section--ink" aria-labelledby="ab-loop-title" data-ab-reveal>
  <div class="ab-inner">
    <div class="ab-loop__intro">
      <p class="ab-eyebrow ab-eyebrow--on-ink">${escapeHtml(copy.loopEyebrow)}</p>
      <h2 id="ab-loop-title" class="ab-title ab-title--on-ink ab-title--wide">${copy.loopTitleHtml}</h2>
    </div>
    <ol class="ab-loop__rail">${cells}</ol>
    <p class="ab-loop__again">${escapeHtml(copy.loopAgain)}</p>
  </div>
</section>`;
}

function spacesHtml(copy, bySlug, labs, langDir) {
  const cards = (copy.spaces || [])
    .map((sp) => {
      let apps = (sp.slugs || [])
        .map((slug) => {
          const p = bySlug[slug];
          if (!p) return null;
          return { slug, name: p.name, href: appIntroHref(slug, langDir) };
        })
        .filter(Boolean);
      if (sp.lab) {
        apps = labs.slice(0, 3).map((l) => ({
          slug: l.slug,
          name: l.titleKo || l.titleEn || l.slug,
          href: `../resources/labs/${escapeHtml(l.slug)}/`,
          lab: true,
        }));
      }
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
  return `<section class="ab-section" aria-labelledby="ab-spaces-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.spacesEyebrow)}</p>
    <h2 id="ab-spaces-title" class="ab-title">${escapeHtml(copy.spacesTitle)}</h2>
    <div class="ab-spaces">${cards}</div>
  </div>
</section>`;
}

function nowHtml(copy, lang, labs, langDir) {
  const activeLabs = labs.filter((l) => l.status === "TESTING" || l.status === "PROTOTYPE" || l.status === "RESEARCH");
  const experiment = labs.find((l) => l.slug === "review-ai") || activeLabs[0];
  const building = activeLabs.filter((l) => !experiment || l.slug !== experiment.slug).slice(0, 2);
  const articles = publishedArticles().slice(0, 2);

  function nowItem({ href, slug, name, title, date, dateLabel, kind }) {
    return `<a class="ab-now__item" href="${escapeHtml(href)}">
      ${logoHtml(slug, name, 52)}
      <span class="ab-now__text">
        <span class="ab-now__kind">${escapeHtml(kind)}</span>
        <strong class="ab-now__name">${escapeHtml(title)}</strong>
        ${
          date
            ? `<time datetime="${escapeHtml(date)}">${escapeHtml(dateLabel || date)}</time>`
            : ""
        }
      </span>
      <span class="ab-now__arrow" aria-hidden="true">↗</span>
    </a>`;
  }

  const buildingItems = building.length
    ? building
        .map((l) => {
          const title = lang === "ko" ? l.displayTitleKo || l.titleKo : l.displayTitleEn || l.titleEn;
          return nowItem({
            href: `../resources/labs/${l.slug}/`,
            slug: l.slug,
            name: title,
            title,
            date: l.updatedAt || "",
            kind: "LAB",
          });
        })
        .join("")
    : `<p class="ab-now__empty">${escapeHtml(copy.nowBuildingFallback)}</p>`;

  const expTitle = experiment
    ? lang === "ko"
      ? experiment.displayTitleKo || experiment.titleKo
      : experiment.displayTitleEn || experiment.titleEn
    : copy.nowEmpty;
  const expBlock = experiment
    ? nowItem({
        href: `../resources/labs/${experiment.slug}/`,
        slug: experiment.slug,
        name: expTitle,
        title: expTitle,
        date: experiment.updatedAt || "",
        kind: "LAB",
      })
    : `<p class="ab-now__empty">${escapeHtml(copy.nowEmpty)}</p>`;

  const shipped = articles.length
    ? articles
        .map((a) => {
          const c = articleCopy(a, lang);
          const product = productBySlug(a.relatedProduct);
          const label = c.title || (product && product.name) || a.slug;
          const slug = a.relatedProduct || "petlog";
          const href = product
            ? appIntroHref(product.slug, langDir)
            : `../news/${a.slug}/`;
          return nowItem({
            href,
            slug,
            name: product ? product.name : label,
            title: label,
            date: a.date,
            dateLabel: formatNewsDate(a.date),
            kind: "UPDATE",
          });
        })
        .join("")
    : `<p class="ab-now__empty">${escapeHtml(copy.nowEmpty)}</p>`;

  return `<section class="ab-section" aria-labelledby="ab-now-title" data-ab-reveal>
  <div class="ab-inner">
    <div class="ab-now__head">
      <div>
        <p class="ab-eyebrow">${escapeHtml(copy.nowEyebrow)}</p>
        <h2 id="ab-now-title" class="ab-title">${escapeHtml(copy.nowTitle)}</h2>
      </div>
      <a class="ab-text-link" href="../news/">${escapeHtml(copy.nowAll)}</a>
    </div>
    <div class="ab-now">
      <article class="ab-now__col">
        <h3 class="ab-now__label">${escapeHtml(copy.nowBuilding)}</h3>
        <div class="ab-now__stack">${buildingItems}</div>
      </article>
      <article class="ab-now__col">
        <h3 class="ab-now__label">${escapeHtml(copy.nowExperiment)}</h3>
        <div class="ab-now__stack">${expBlock}</div>
      </article>
      <article class="ab-now__col">
        <h3 class="ab-now__label">${escapeHtml(copy.nowShipped)}</h3>
        <div class="ab-now__stack">${shipped}</div>
      </article>
    </div>
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
    <div class="ab-explore">${panels}</div>
  </div>
</section>`;
}

function buildLogHtml(copy, lang, langDir = lang) {
  const articles = publishedArticles();
  const entries = buildTimelineEntries(articles, {
    productBySlug,
    articleCopy,
    articleProductSlug,
  }).slice(0, 14);

  if (!entries.length) return "";

  const byYear = new Map();
  for (const entry of entries) {
    const y = String(entry.date || "").slice(0, 4) || "2026";
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(entry);
  }

  const years = [...byYear.entries()]
    .sort((a, b) => String(b[0]).localeCompare(String(a[0])))
    .map(([year, items]) => {
      const rows = items
        .map((entry) => {
          const pack = entry.copy || {};
          const c = lang === "ko" ? pack.ko || pack.en || {} : pack.en || pack.ko || {};
          const product = productBySlug(entry.product);
          const name = product ? product.name : entry.product || "Newon";
          const displayDate = formatHistoryDisplayDate(entry.date, entry.datePrecision);
          const datetime = historyDatetimeAttr(entry.date, entry.datePrecision);
          const type = entry.type || entry.category || "";
          const href = entry.product ? appIntroHref(entry.product, langDir) : "";
          const icon = logoHtml(entry.product || "", name, 40);
          const titleInner = href
            ? `<a href="${escapeHtml(href)}">${escapeHtml(c.title || name)}</a>`
            : escapeHtml(c.title || name);
          return `<li class="ab-log__item">
            <time class="ab-log__date" datetime="${escapeHtml(datetime)}">${escapeHtml(displayDate)}</time>
            <div class="ab-log__body">
              ${icon}
              <div class="ab-log__copy">
                ${type ? `<span class="ab-log__type">${escapeHtml(String(type).toUpperCase())}</span>` : ""}
                <p class="ab-log__product">${escapeHtml(name)}</p>
                <h3 class="ab-log__title">${titleInner}</h3>
                ${c.description ? `<p class="ab-log__desc">${escapeHtml(c.description)}</p>` : ""}
              </div>
            </div>
          </li>`;
        })
        .join("");
      return `<div class="ab-log__year">
        <h3 class="ab-log__year-label">${escapeHtml(year)}</h3>
        <ol class="ab-log__list">${rows}</ol>
      </div>`;
    })
    .join("");

  return `<section class="ab-section" aria-labelledby="ab-log-title" data-ab-reveal>
  <div class="ab-inner">
    <p class="ab-eyebrow">${escapeHtml(copy.logEyebrow)}</p>
    <h2 id="ab-log-title" class="ab-title">${escapeHtml(copy.logTitle)}</h2>
    ${copy.logNote ? `<p class="ab-lead">${escapeHtml(copy.logNote)}</p>` : ""}
    <div class="ab-log">${years}</div>
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
    <div class="ab-close__cta">
      <a class="ab-btn ab-btn--on-ink" href="../portfolio/">${escapeHtml(copy.closeProducts)}</a>
      <a class="ab-btn ab-btn--ghost-on-ink" href="../ideas/">${escapeHtml(copy.closeIdeas)}</a>
      <a class="ab-btn ab-btn--ghost-on-ink" href="../business/">${escapeHtml(copy.closeBusiness)}</a>
    </div>
  </div>
</section>`;
}

/**
 * @param {string} lang - "ko" | "en" (other locales use EN copy)
 * @param {string} [langDir] - used for product pageHref substitution
 */
export function buildAboutPageBody(lang, langDir = lang) {
  const copyLang = lang === "ko" ? "ko" : "en";
  const copy = getAboutPageCopy(copyLang);
  const stats = companyStats();
  const bySlug = projectsBySlug(copyLang);
  // Fix pageHref for current lang dir
  for (const p of Object.values(bySlug)) {
    if (p.pageHref && p.pageHref.includes("{{LANG}}")) {
      p.pageHref = p.pageHref.replace("{{LANG}}", langDir);
    }
  }
  const products = orderedProducts(copy, bySlug);
  const labs = getLabsExperiments();

  return `${heroHtml(copy)}
${metricsHtml(copy, stats)}
${glanceHtml(copy)}
${doHtml(copy)}
${principlesHtml(copy)}
${universeHtml(copy, products, langDir)}
${loopHtml(copy)}
${spacesHtml(copy, bySlug, labs, langDir)}
${nowHtml(copy, copyLang, labs, langDir)}
${buildLogHtml(copy, copyLang, langDir)}
${exploreHtml(copy)}
${ideaHtml(copy)}
${closeHtml(copy)}`;
}

export function getAboutSeo(lang) {
  const copy = getAboutPageCopy(lang === "ko" ? "ko" : "en");
  return { seoTitle: copy.seoTitle, metaDescription: copy.metaDescription };
}
