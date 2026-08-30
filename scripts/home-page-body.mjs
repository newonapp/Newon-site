/**
 * Homepage studio body — below-hero only (hero frozen).
 * Home V1.0: summary page, not a dump of every hub.
 * Flow: Products → Does → Business → Built → Labs → Studio → Latest → Resources → Explore → Final
 */
import { escapeHtml } from "./hub-utils.mjs";
import { getHomePageCopy } from "./home-page-copy.mjs";
import { getCompanyMetrics } from "./company-metrics.mjs";
import { getCompanyProjects } from "./company-portfolio-data.mjs";
import { getLabsExperiments, LAB_PIPELINE } from "./lab-experiments.mjs";
import { publishedArticles, articleCopy, formatNewsDate } from "./news-data.mjs";
import { getNaverBlogPosts } from "./naver-blog-posts.mjs";
import { getMediaHubItems } from "./media-data.mjs";
import { APP_CATALOG, NAV_FLYOUT_SLUGS } from "./portfolio-data.mjs";

/** Full Newon app catalog on home (nav order). */
const PRODUCT_SLUGS = [...NAV_FLYOUT_SLUGS];

const LAB_SLUGS = ["review-ai", "newon-qr", "ai-experiment"];

const HOME_HASH_BY_SLUG = Object.fromEntries(
  APP_CATALOG.filter((a) => a.homeHash).map((a) => [a.slug, a.homeHash])
);

function langDir(lang) {
  return lang === "ko" ? "ko" : "en";
}

/** App intro overlays live on the locale home page (`#ox-month`, `#goalup-app`, …). */
function productHref(slug) {
  if (slug === "404-human") return "404-human/";
  const hash = HOME_HASH_BY_SLUG[slug];
  if (hash) {
    if (hash.endsWith("/")) return hash.replace(/^\//, "");
    return hash.startsWith("#") ? hash : `#${hash}`;
  }
  return `portfolio/${slug}/`;
}

function projectsBySlug(lang) {
  const list = getCompanyProjects(langDir(lang));
  return Object.fromEntries(list.map((p) => [p.slug, p]));
}

function storeLine(p, copy) {
  const parts = [];
  if (p.appStoreUrl) parts.push(copy.storeAppStore);
  if (p.googlePlayUrl) parts.push(copy.storeGooglePlay);
  if (!parts.length) return "";
  return `<span class="hs-prod__plat">${escapeHtml(copy.availableOn)} ${escapeHtml(parts.join(" · "))}</span>`;
}

function productCat(p, copy) {
  return (copy.productCats && copy.productCats[p.slug]) || p.categoryLabel || "APP";
}

function selectedProductsHtml(copy, bySlug) {
  const apps = PRODUCT_SLUGS.map((s) => bySlug[s]).filter(Boolean);
  const cards = apps
    .map((p, i) => {
      const icon = p.icon
        ? `<img class="hs-prod__icon" src="${escapeHtml(p.icon)}" alt="" width="56" height="56" loading="lazy" decoding="async" />`
        : "";
      return `<a class="hs-prod" href="${escapeHtml(productHref(p.slug))}">
        <span class="hs-prod__n">${String(i + 1).padStart(2, "0")}</span>
        ${icon}
        <span class="hs-prod__cat">${escapeHtml(productCat(p, copy))}</span>
        <span class="hs-prod__name">${escapeHtml(p.name)}</span>
        <span class="hs-prod__desc">${escapeHtml(p.oneLiner || p.summary || "")}</span>
        ${storeLine(p, copy)}
        <span class="hs-prod__go">${escapeHtml(copy.viewProduct)}</span>
      </a>`;
    })
    .join("");
  return `<section id="hs-products" class="hs-section hs-section--products" data-hs-section aria-labelledby="hs-products-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.selectedEyebrow)}</p>
      <h2 id="hs-products-title" class="hs-h2">${copy.selectedTitleHtml}</h2>
      <p class="hs-lead">${escapeHtml(copy.selectedLead)}</p>
    </header>
    <div class="hs-board hs-prod-grid">${cards}</div>
  </div>
</section>`;
}

function doesHtml(copy) {
  const areas = [
    {
      n: "01",
      title: copy.doesProductsTitle,
      items: copy.doesProductsItems,
      body: copy.doesProductsBody,
      cta: copy.doesProductsCta,
      href: "products/",
    },
    {
      n: "02",
      title: copy.doesBusinessTitle,
      items: copy.doesBusinessItems,
      body: copy.doesBusinessBody,
      cta: copy.doesBusinessCta,
      href: "business/",
    },
    {
      n: "03",
      title: copy.doesStudioTitle,
      items: copy.doesStudioItems,
      body: copy.doesStudioBody,
      cta: copy.doesStudioCta,
      href: "studio/",
    },
    {
      n: "04",
      title: copy.doesLabsTitle,
      items: copy.doesLabsItems,
      body: copy.doesLabsBody,
      cta: copy.doesLabsCta,
      href: "resources/labs/",
    },
  ];
  return `<section id="hs-does" class="hs-section hs-section--does" data-hs-section aria-labelledby="hs-does-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.doesEyebrow)}</p>
      <h2 id="hs-does-title" class="hs-h2">${copy.doesTitleHtml}</h2>
      <p class="hs-lead">${escapeHtml(copy.doesLead)}</p>
    </header>
    <div class="hs-board hs-does-index" role="list">${areas
      .map(
        (a) => `<a class="hs-does-row" href="${escapeHtml(a.href)}" role="listitem">
        <span class="hs-does-row__n">${escapeHtml(a.n)}</span>
        <span class="hs-does-row__main">
          <span class="hs-does-row__title">${escapeHtml(a.title)}</span>
          <span class="hs-does-row__items">${escapeHtml(a.items)}</span>
        </span>
        <span class="hs-does-row__body">${escapeHtml(a.body)}</span>
        <span class="hs-does-row__cta">${escapeHtml(a.cta)}</span>
      </a>`
      )
      .join("")}</div>
  </div>
</section>`;
}

function businessHtml(copy) {
  const svcs = [
    { n: "01", title: copy.businessBuildTitle, body: copy.businessBuildBody, href: "business/build/" },
    { n: "02", title: copy.businessAutoTitle, body: copy.businessAutoBody, href: "business/automation/" },
    { n: "03", title: copy.businessResearchTitle, body: copy.businessResearchBody, href: "business/research/" },
    { n: "04", title: copy.businessSolutionsTitle, body: copy.businessSolutionsBody, href: "business/solutions/" },
  ];
  return `<section id="hs-business" class="hs-section hs-section--business" data-hs-section aria-labelledby="hs-business-title">
  <div class="hs-wrap">
    <div class="hs-board hs-biz-split">
      <div class="hs-biz-split__intro">
        <p class="hs-kicker">${escapeHtml(copy.businessEyebrow)}</p>
        <h2 id="hs-business-title" class="hs-h2">${copy.businessTitleHtml}</h2>
        <p class="hs-lead">${escapeHtml(copy.businessLead)}</p>
        <div class="hs-actions">
          <a class="hs-btn hs-btn--fill" href="business/inquiry/">${escapeHtml(copy.businessInquiry)}</a>
          <a class="hs-link" href="business/">${escapeHtml(copy.businessExplore)}</a>
        </div>
      </div>
      <ol class="hs-biz-stack">${svcs
        .map(
          (s) => `<li>
          <a class="hs-biz-stack__row" href="${escapeHtml(s.href)}">
            <span class="hs-biz-stack__n">${escapeHtml(s.n)}</span>
            <span class="hs-biz-stack__title">${escapeHtml(s.title)}</span>
            <span class="hs-biz-stack__body">${escapeHtml(s.body)}</span>
            <span class="hs-biz-stack__go" aria-hidden="true">→</span>
          </a>
        </li>`
        )
        .join("")}</ol>
    </div>
  </div>
</section>`;
}

function builtHtml(copy, stats) {
  const cols = [
    { n: "01", title: copy.proofBuildTitle, body: copy.proofBuildBody, tags: copy.proofBuildTags },
    { n: "02", title: copy.proofShipTitle, body: copy.proofShipBody, tags: copy.proofShipTags },
    { n: "03", title: copy.proofLearnTitle, body: copy.proofLearnBody, tags: copy.proofLearnTags },
  ];
  const metrics = [
    { value: stats.products, label: copy.statsProducts },
    { value: stats.languages, label: copy.statsLanguages },
    { value: stats.countries, label: copy.statsCountries },
  ];
  return `<section id="hs-built" class="hs-section hs-section--built" data-hs-section aria-labelledby="hs-built-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.proofEyebrow)}</p>
      <h2 id="hs-built-title" class="hs-h2">${copy.proofTitleHtml}</h2>
      <p class="hs-lead">${escapeHtml(copy.proofLead)}</p>
    </header>
    <ol class="hs-board hs-built-rail">${cols
      .map(
        (c) => `<li class="hs-built-rail__step">
        <span class="hs-built-rail__n">${escapeHtml(c.n)}</span>
        <h3 class="hs-built-rail__title">${escapeHtml(c.title)}</h3>
        <p class="hs-built-rail__body">${escapeHtml(c.body)}</p>
        <p class="hs-built-rail__tags">${escapeHtml(c.tags)}</p>
      </li>`
      )
      .join("")}</ol>
    <ul class="hs-board hs-built-stats" aria-label="Company metrics">
      ${metrics
        .map(
          (m) => `<li>
        <span class="hs-built-stats__val" data-hs-count>${escapeHtml(m.value)}</span>
        <span class="hs-built-stats__lbl">${escapeHtml(m.label)}</span>
      </li>`
        )
        .join("")}
    </ul>
  </div>
</section>`;
}

function labsHtml(copy, lang) {
  const isKo = lang === "ko";
  const bySlug = Object.fromEntries(getLabsExperiments().map((e) => [e.slug, e]));
  const pipeline = LAB_PIPELINE.map((s) => `<span class="hs-labs-pipe__step">${escapeHtml(s)}</span>`).join(
    `<span class="hs-labs-pipe__sep" aria-hidden="true">→</span>`
  );
  const exps = LAB_SLUGS.map((slug) => bySlug[slug]).filter(Boolean).slice(0, 3);
  const card = (exp, i, featured = false) => {
    const title = isKo ? exp.displayTitleKo || exp.titleKo : exp.displayTitleEn || exp.titleEn;
    const question = isKo ? exp.questionListKo || exp.questionKo : exp.questionListEn || exp.questionEn;
    const status = isKo ? exp.stageLabelKo || exp.status : exp.stageLabelEn || exp.status;
    return `<a class="hs-lab${featured ? " hs-lab--feat" : ""}" href="resources/labs/${escapeHtml(exp.slug)}/">
        <span class="hs-lab__meta">
          <span class="hs-lab__n">${String(i + 1).padStart(2, "0")}</span>
          <span class="hs-lab__status">${escapeHtml(status)}</span>
        </span>
        <h3 class="hs-lab__name">${escapeHtml(title)}</h3>
        <p class="hs-lab__q">${escapeHtml(String(question || "").replace(/\n/g, " "))}</p>
        <span class="hs-lab__go">${escapeHtml(copy.labsView)}</span>
      </a>`;
  };
  const feat = exps[0] ? card(exps[0], 0, true) : "";
  const rest = exps
    .slice(1)
    .map((exp, i) => card(exp, i + 1, false))
    .join("");
  return `<section id="hs-labs" class="hs-section hs-section--labs" data-hs-section aria-labelledby="hs-labs-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.labsEyebrow)}</p>
      <h2 id="hs-labs-title" class="hs-h2">${copy.labsTitleHtml}</h2>
      <p class="hs-lead">${escapeHtml(copy.labsLead)}</p>
    </header>
    <p class="hs-labs-pipe" aria-label="Labs pipeline">${pipeline}</p>
    <div class="hs-labs-layout">
      ${feat}
      <div class="hs-labs-rest">${rest}</div>
    </div>
    <p class="hs-more"><a class="hs-link" href="resources/labs/">${escapeHtml(copy.labsAll)}</a></p>
  </div>
</section>`;
}

function studioHtml(copy) {
  const areas = [
    { title: copy.studioBrandTitle, items: copy.studioBrandItems, href: "studio/brand/" },
    { title: copy.studioDigitalTitle, items: copy.studioDigitalItems, href: "studio/digital/" },
    { title: copy.studioContentTitle, items: copy.studioContentItems, href: "studio/content/" },
    { title: copy.studioIpTitle, items: copy.studioIpItems, href: "studio/ip/" },
  ];
  return `<section id="hs-studio" class="hs-section hs-section--studio" data-hs-section aria-labelledby="hs-studio-title">
  <div class="hs-wrap">
    <header class="hs-head hs-head--row">
      <div>
        <p class="hs-kicker">${escapeHtml(copy.studioEyebrow)}</p>
        <h2 id="hs-studio-title" class="hs-h2">${copy.studioTitleHtml}</h2>
        <p class="hs-lead">${escapeHtml(copy.studioLead)}</p>
      </div>
      <p class="hs-more hs-more--inline"><a class="hs-link" href="studio/">${escapeHtml(copy.studioAll)}</a></p>
    </header>
    <div class="hs-board hs-studio-wall" role="list">${areas
      .map(
        (a, i) => `<a class="hs-studio-wall__row" href="${escapeHtml(a.href)}" role="listitem">
        <span class="hs-studio-wall__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="hs-studio-wall__title">${escapeHtml(a.title)}</span>
        <span class="hs-studio-wall__items">${escapeHtml(a.items)}</span>
        <span class="hs-studio-wall__go" aria-hidden="true">→</span>
      </a>`
      )
      .join("")}</div>
  </div>
</section>`;
}


function latestItems(lang) {
  const isKo = lang === "ko";
  const items = [];

  for (const a of publishedArticles().slice(0, 1)) {
    const c = articleCopy(a, langDir(lang));
    items.push({
      typeLabel: "NEWS",
      title: c.title || c.latestTitle || a.slug,
      date: formatNewsDate(a.date),
      href: `news/${a.slug}/`,
      sort: a.date,
    });
  }

  for (const b of getNaverBlogPosts().slice(0, 1)) {
    items.push({
      typeLabel: "BLOG",
      title: isKo ? b.titleKo : b.titleEn,
      date: b.date,
      href: b.url,
      external: true,
      sort: b.date.replace(/\./g, "-"),
    });
  }

  for (const m of getMediaHubItems().slice(0, 1)) {
    items.push({
      typeLabel: "MEDIA",
      title: isKo ? m.titleKo : m.titleEn,
      date: m.date.replace(/-/g, "."),
      href: "media/",
      sort: m.date,
    });
  }

  for (const exp of getLabsExperiments().filter((e) => LAB_SLUGS.includes(e.slug)).slice(0, 1)) {
    items.push({
      typeLabel: "LAB",
      title: isKo ? exp.displayTitleKo || exp.titleKo : exp.displayTitleEn || exp.titleEn,
      date: exp.updatedAt.replace(/-/g, "."),
      href: `resources/labs/${exp.slug}/`,
      sort: exp.updatedAt,
    });
  }

  return items.sort((a, b) => (a.sort < b.sort ? 1 : a.sort > b.sort ? -1 : 0)).slice(0, 4);
}

function latestHtml(copy, lang) {
  const items = latestItems(lang);
  if (!items.length) return "";
  const rows = items
    .map((it) => {
      const ext = it.external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="hs-latest" href="${escapeHtml(it.href)}"${ext}>
      <span class="hs-latest__type">${escapeHtml(it.typeLabel)}</span>
      <span class="hs-latest__date">${escapeHtml(it.date)}</span>
      <span class="hs-latest__title">${escapeHtml(it.title)}</span>
      <span class="hs-latest__go" aria-hidden="true">${escapeHtml(copy.latestView)}</span>
    </a>`;
    })
    .join("");
  return `<section id="hs-latest" class="hs-section hs-section--latest" data-hs-section aria-labelledby="hs-latest-title">
  <div class="hs-wrap">
    <header class="hs-head hs-head--row">
      <div>
        <p class="hs-kicker">${escapeHtml(copy.latestEyebrow)}</p>
        <h2 id="hs-latest-title" class="hs-h2">${copy.latestTitleHtml}</h2>
      </div>
      <p class="hs-more hs-more--inline"><a class="hs-link" href="news/">${escapeHtml(copy.latestAll)}</a></p>
    </header>
    <div class="hs-board hs-latest-list">${rows}</div>
  </div>
</section>`;
}

function resourcesHtml(copy) {
  const items = [
    {
      n: "01",
      title: copy.resourceStoreTitle,
      items: copy.resourceStoreItems,
      body: copy.resourceStoreBody,
      cta: copy.resourceStoreCta,
      href: "resources/store/",
    },
    {
      n: "02",
      title: copy.resourceInsightsTitle,
      items: copy.resourceInsightsItems,
      body: copy.resourceInsightsBody,
      cta: copy.resourceInsightsCta,
      href: "resources/insights/",
    },
    {
      n: "03",
      title: copy.resourceBlogTitle,
      items: copy.resourceBlogItems,
      body: copy.resourceBlogBody,
      cta: copy.resourceBlogCta,
      href: "resources/blog/",
    },
    {
      n: "04",
      title: copy.resourceLabsTitle,
      items: copy.resourceLabsItems,
      body: copy.resourceLabsBody,
      cta: copy.resourceLabsCta,
      href: "resources/labs/",
    },
  ];
  return `<section id="hs-resources" class="hs-section hs-section--resources" data-hs-section aria-labelledby="hs-resources-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.resourcesEyebrow)}</p>
      <h2 id="hs-resources-title" class="hs-h2">${copy.resourcesTitleHtml}</h2>
      <p class="hs-lead">${escapeHtml(copy.resourcesLead)}</p>
    </header>
    <div class="hs-board hs-res-dir">${items
      .map(
        (it) => `<a class="hs-res-dir__row" href="${escapeHtml(it.href)}">
        <span class="hs-res-dir__n">${escapeHtml(it.n)}</span>
        <span class="hs-res-dir__main">
          <span class="hs-res-dir__title">${escapeHtml(it.title)}</span>
          <span class="hs-res-dir__items">${escapeHtml(it.items)}</span>
        </span>
        <span class="hs-res-dir__body">${escapeHtml(it.body)}</span>
        <span class="hs-res-dir__cta">${escapeHtml(it.cta)}</span>
      </a>`
      )
      .join("")}</div>
  </div>
</section>`;
}

function exploreHtml(copy) {
  const feat = {
    n: "01",
    title: copy.exploreAboutTitle,
    body: copy.exploreAboutBody,
    href: "about/",
  };
  const rest = [
    { n: "02", title: copy.explorePortfolioTitle, body: copy.explorePortfolioBody, href: "portfolio/" },
    { n: "03", title: copy.exploreNewsTitle, body: copy.exploreNewsBody, href: "news/" },
    { n: "04", title: copy.exploreMediaTitle, body: copy.exploreMediaBody, href: "media/" },
  ];
  return `<section id="hs-explore" class="hs-section hs-section--explore" data-hs-section aria-labelledby="hs-explore-title">
  <div class="hs-wrap">
    <header class="hs-head">
      <p class="hs-kicker">${escapeHtml(copy.exploreEyebrow)}</p>
      <h2 id="hs-explore-title" class="hs-h2">${copy.exploreTitleHtml}</h2>
    </header>
    <nav class="hs-board hs-explore-split" aria-label="${escapeHtml(copy.exploreEyebrow)}">
      <a class="hs-explore-feat" href="${escapeHtml(feat.href)}">
        <span class="hs-explore-feat__n">${escapeHtml(feat.n)}</span>
        <span class="hs-explore-feat__title">${escapeHtml(feat.title)}</span>
        <span class="hs-explore-feat__body">${escapeHtml(feat.body)}</span>
        <span class="hs-explore-feat__go">EXPLORE →</span>
      </a>
      <div class="hs-explore-list">${rest
        .map(
          (it) => `<a class="hs-explore-list__row" href="${escapeHtml(it.href)}">
          <span class="hs-explore-list__n">${escapeHtml(it.n)}</span>
          <span class="hs-explore-list__title">${escapeHtml(it.title)}</span>
          <span class="hs-explore-list__body">${escapeHtml(it.body)}</span>
          <span class="hs-explore-list__go" aria-hidden="true">→</span>
        </a>`
        )
        .join("")}</div>
    </nav>
  </div>
</section>`;
}

function finalHtml(copy) {
  return `<section id="hs-final" class="hs-final hs-final--ink hs-final--rail" data-hs-section aria-labelledby="hs-final-title">
  <div class="hs-wrap">
    <div class="hs-final__rail">
      <div class="hs-final__meta">
        <p class="hs-kicker hs-kicker--on-ink">${escapeHtml(copy.finalEyebrow)}</p>
        <span class="hs-final__meta-line" aria-hidden="true"></span>
        <span class="hs-final__meta-tag">INQUIRY</span>
      </div>
      <div class="hs-final__grid">
        <div class="hs-final__copy">
          <h2 id="hs-final-title" class="hs-h2 hs-h2--on-ink hs-final__title">${copy.finalTitleHtml}</h2>
        </div>
        <div class="hs-final__side">
          <p class="hs-lead hs-lead--on-ink hs-final__lead">${escapeHtml(copy.finalLead)}</p>
          <div class="hs-actions hs-final__actions">
            <a class="hs-btn hs-btn--fill hs-final__btn" href="business/inquiry/">${escapeHtml(copy.finalPrimary)}</a>
            <a class="hs-final__ghost" href="business/">${escapeHtml(copy.finalSecondary)}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}


/** @param {string} lang */
export function buildHomeStudioBody(lang) {
  const copy = getHomePageCopy(lang);
  const stats = getCompanyMetrics();
  const bySlug = projectsBySlug(lang);

  return `${selectedProductsHtml(copy, bySlug)}
${doesHtml(copy)}
${businessHtml(copy)}
${builtHtml(copy, stats)}
${labsHtml(copy, lang)}
${studioHtml(copy)}
${latestHtml(copy, lang)}
${resourcesHtml(copy)}
${exploreHtml(copy)}
${finalHtml(copy)}`;
}
