/**
 * Resources INDEX only — /{lang}/resources/
 * Primary explore: Store · Insights · Blog · Labs
 * Secondary: Notes · Education
 */
import {
  RESOURCE_PRIMARY_PAGES,
  RESOURCE_SECONDARY_PAGES,
} from "./resources-catalog.mjs";
import {
  buildSearchIndex,
} from "./resources-data.mjs";

const NS_CSS_V = "20260828rh22";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ctaDown(label, fb = "Explore ↓") {
  const s = String(label || fb).replace(/\s*[→↗]\s*$/, "").trim();
  return `${s} ↓`;
}

function heroRail(items, ariaLabel) {
  const parts = items.map((item, i) => {
    const link = `<a class="ns-rail__link" href="${item.href}">${item.label}</a>`;
    if (i === 0) return link;
    return `<span class="ns-rail__sep" aria-hidden="true">·</span>${link}`;
  });
  return `<nav class="ns-rail" aria-label="${ariaLabel}">${parts.join("")}</nav>`;
}

function heroBoard({ parent, live, items, ariaLabel }) {
  const rows = items
    .map(
      (item, i) => `<li>
      <a class="ns-board__row" href="${item.href}">
        <span class="ns-board__n">${pad2(i + 1)}</span>
        <span class="ns-board__t">${item.label}</span>
        <span class="ns-board__go" aria-hidden="true">→</span>
      </a>
    </li>`
    )
    .join("");
  return `<aside class="ns-hero__visual" aria-label="${ariaLabel}">
    <div class="ns-board">
      <div class="ns-board__head">
        <span class="ns-board__live"><i></i> ${live}</span>
        <span class="ns-board__meta">${parent}</span>
      </div>
      <div class="ns-board__mark" aria-hidden="true">
        <span class="ns-board__word">${parent}</span>
        <span class="ns-board__dot"></span>
      </div>
      <ol class="ns-board__list">${rows}</ol>
    </div>
  </aside>`;
}

function cardVisual(slug) {
  switch (slug) {
    case "store":
      return `<div class="rh-viz rh-viz--store" aria-hidden="true">
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
      </div>`;
    case "insights":
      return `<div class="rh-viz rh-viz--blog" aria-hidden="true">
        <span><i>IN</i><b></b></span>
        <span><i>AI</i><b></b></span>
        <span><i>MK</i><b></b></span>
      </div>`;
    case "blog":
      return `<div class="rh-viz rh-viz--blog" aria-hidden="true">
        <span><i>01</i><b></b></span>
        <span><i>02</i><b></b></span>
        <span><i>03</i><b></b></span>
      </div>`;
    case "labs":
      return `<div class="rh-viz rh-viz--labs" aria-hidden="true">
        <span>TEST</span><span>BUILD</span><span>LEARN</span><span>REPEAT</span>
      </div>`;
    case "newsletter":
      return `<div class="rh-viz rh-viz--news" aria-hidden="true">
        <p>NOTES</p>
        <span>001</span><span>002</span><span>003</span>
      </div>`;
    case "education":
      return `<div class="rh-viz rh-viz--edu" aria-hidden="true">
        <p>GUIDE</p>
        <span>01</span><span>02</span><span>03</span>
      </div>`;
    default:
      return `<div class="rh-viz" aria-hidden="true"></div>`;
  }
}

function surfaceFromPage(page, copy) {
  const items = copy.indexItems || {};
  const item = items[page.slug];
  if (!item) return null;
  return {
    slug: page.slug,
    href: page.slug === "newsletter" || page.slug === "education" ? `${page.slug}/` : `${page.slug}/`,
    item,
  };
}

/**
 * @param {{ escapeHtml: Function, brHeadline: Function, tField: Function }} ctx
 */
export function buildResourcesIndexBody(copies, lang, ctx) {
  const { escapeHtml, brHeadline } = ctx;
  const copy = copies.index;
  const nlCopy = copies.newsletter || {};
  const ko = lang === "ko";

  const primarySurfaces = RESOURCE_PRIMARY_PAGES.map((p) => surfaceFromPage(p, copy)).filter(Boolean);
  const secondarySurfaces = RESOURCE_SECONDARY_PAGES.map((p) => surfaceFromPage(p, copy)).filter(Boolean);

  const exploreCards = primarySurfaces
    .map((s, i) => {
      const item = s.item || {};
      const n = pad2(i + 1);
      const cls = `rh-card rh-card--${escapeHtml(s.slug)}`;
      const head = `<div class="rh-card__head">
        <span class="rh-card__num" aria-hidden="true">${n}</span>
        <span class="rh-card__cat">${escapeHtml(item.category || "")}</span>
      </div>
      <h3 class="rh-card__title">${escapeHtml(item.title || s.slug.toUpperCase())}</h3>
      <p class="rh-card__lead">${brHeadline(item.lead || item.desc || "")}</p>
      ${
        item.desc && item.lead && item.desc !== item.lead
          ? `<p class="rh-card__desc">${escapeHtml(item.desc)}</p>`
          : ""
      }
      ${
        item.meta
          ? `<div class="rh-card__meta">
        <span>${escapeHtml(item.meta)}</span>
        ${item.metaSub ? `<span class="rh-card__meta-sub">${escapeHtml(item.metaSub)}</span>` : ""}
      </div>`
          : ""
      }`;

      return `<a class="${cls}" href="${escapeHtml(s.href)}" data-rs-reveal>
      ${head}
      <span class="rh-card__cta">${escapeHtml(item.cta || (ko ? "둘러보기 ↗" : "EXPLORE ↗"))}</span>
      ${cardVisual(s.slug)}
    </a>`;
    })
    .join("\n");

  const secondaryCards = secondarySurfaces
    .map((s) => {
      const item = s.item || {};
      const title =
        s.slug === "newsletter"
          ? escapeHtml(item.title || (ko ? "NEWON NOTES" : "NEWON NOTES"))
          : escapeHtml(item.title || "EDUCATION");
      return `<a class="rx-secondary__card" href="${escapeHtml(s.href)}" data-rs-reveal>
      <span class="rx-secondary__label">${escapeHtml(item.category || s.slug.toUpperCase())}</span>
      <strong class="rx-secondary__title">${title}</strong>
      <span class="rx-secondary__lead">${escapeHtml(item.lead || item.desc || "")}</span>
      <span class="rx-secondary__cta">${escapeHtml(item.cta || (ko ? "보기 ↗" : "Explore ↗"))}</span>
    </a>`;
    })
    .join("\n");

  const filterSlugs = ["all", ...RESOURCE_PRIMARY_PAGES.map((p) => p.slug)];
  const filters = filterSlugs
    .map((slug) => {
      const label =
        slug === "all"
          ? copy.searchFilterAll || (ko ? "전체" : "All")
          : copies[slug]?.navLabel || slug.toUpperCase();
      return `<button type="button" class="rx-filter${slug === "all" ? " is-on" : ""}" data-rx-type="${escapeHtml(slug)}">${escapeHtml(label)}</button>`;
    })
    .join("");

  const searchItems = buildSearchIndex(lang);
  /* Raw JSON in <script type="application/json"> — do not HTML-escape (breaks JSON.parse). */
  const searchJson = JSON.stringify(searchItems).replace(/</g, "\\u003c");
  const suggest = searchItems
    .slice(0, 3)
    .map(
      (it) =>
        `<a class="rx-suggest" href="${escapeHtml(it.url)}"><em>${escapeHtml(String(it.type || "").toUpperCase())}</em><strong>${escapeHtml(it.title)}</strong></a>`
    )
    .join("");

  const heroAreas = primarySurfaces.map((s) => ({
    href: escapeHtml(s.href),
    label: escapeHtml(s.item?.title || s.slug.toUpperCase()),
  }));
  const areaLine = heroAreas.map((a) => a.label).join(" · ");
  const heroLead = areaLine
    ? `${areaLine} — ${escapeHtml(copy.lead || "")}`
    : escapeHtml(copy.lead || "");
  const heroCtaBrowse = escapeHtml(
    ctaDown(copy.ctaBrowse, ko ? "리소스 둘러보기" : "Browse resources")
  );
  const heroCtaLabs = escapeHtml(copy.ctaLabs || (ko ? "Labs 보기 ↗" : "View Labs ↗"));

  return `<link rel="stylesheet" href="/newon-studio.css?v=${NS_CSS_V}" />

<section class="ns-hero rs-explore-hero" data-rs-reveal aria-labelledby="rs-hero-title">
  <div class="ns-hero__bg" aria-hidden="true"></div>
  <div class="ns-inner ns-hero__stage">
    <div class="ns-hero__copy">
      <p class="ns-kicker"><span class="ns-kicker__mark" aria-hidden="true">N</span>${escapeHtml(copy.eyebrow || "NEWON RESOURCES")}</p>
      <h1 class="ns-title" id="rs-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="ns-lead">${heroLead}</p>
      <div class="ns-actions">
        <a class="btn btn-ghost" href="#rx-cats">${heroCtaBrowse}</a>
        <a class="btn btn-primary" href="labs/">${heroCtaLabs}</a>
      </div>
      ${heroRail(heroAreas, ko ? "Resources 영역" : "Resources areas")}
    </div>
    ${heroBoard({
      parent: "RESOURCES",
      live: "RESOURCE MAP",
      items: heroAreas,
      ariaLabel: ko ? "Resources 영역 맵" : "Resources area map",
    })}
  </div>
  <div class="ns-hero__rule" aria-hidden="true"></div>
</section>

<section class="rs-section rh-explore" id="rx-cats" aria-labelledby="rh-explore-title">
  <div class="rx-shell">
    <header class="rh-explore__head">
      <div class="rh-explore__copy">
        <p class="rs-eyebrow">${escapeHtml(copy.sectionIndex || (ko ? "탐색" : "EXPLORE RESOURCES"))}</p>
        <h2 class="rh-explore__title" id="rh-explore-title">${escapeHtml(copy.sectionIndexTitle || "Resources")}</h2>
      </div>
      <p class="rh-explore__count">
        <span class="rh-explore__count-k">${escapeHtml(copy.indexCountLabel || (ko ? "목록" : "INDEX"))}</span>
        <span class="rh-explore__count-n">${escapeHtml(copy.sectionIndexRange || `01—${pad2(primarySurfaces.length)}`)}</span>
      </p>
    </header>
    <div class="rh-grid">${exploreCards}</div>
  </div>
</section>

<section class="rx-find" id="rs-content" data-rs-reveal aria-labelledby="rx-find-title">
  <div class="rx-shell">
    <h2 class="rx-find__title" id="rx-find-title">${escapeHtml(copy.searchTitle || (ko ? "무엇을 찾고 있나요?" : "What are you looking for?"))}</h2>
    <div class="rx-find__panel" data-rs-search data-rs-search-ready data-rx-find>
      <div class="rx-find__field">
        <span class="rx-find__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M20 20l-3.4-3.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
        <label class="visually-hidden" for="rs-search-input">${escapeHtml(copy.searchTitle || "Search")}</label>
        <input id="rs-search-input" class="rx-find__input" type="search" placeholder="${escapeHtml(copy.searchPlaceholder || (ko ? "리소스, 실험, 글 또는 자료 검색" : "Search resources, labs, writing…"))}" data-rs-search-input autocomplete="off" />
        <kbd class="rx-find__kbd" aria-hidden="true">⌘ K</kbd>
      </div>
      <div class="rx-find__filters" data-rx-filters>${filters}</div>
      <div class="rx-find__hits" data-rs-search-results hidden></div>
      <p class="rx-find__empty" data-rx-empty hidden>${escapeHtml(copy.searchEmpty || (ko ? "일치하는 리소스가 없습니다." : "No matching resources."))}</p>
      <div class="rx-find__suggest" data-rx-suggest>${suggest}</div>
      <script type="application/json" id="rs-search-index">${searchJson}</script>
    </div>
  </div>
</section>

${
  secondaryCards
    ? `<section class="rx-block rx-secondary" data-rs-reveal aria-labelledby="rx-secondary-title">
  <div class="rx-shell">
    <header class="rx-head">
      <div>
        <p class="rx-kicker">${escapeHtml(copy.secondaryEyebrow || "SECONDARY RESOURCES")}</p>
        <h2 class="rx-h2" id="rx-secondary-title">${escapeHtml(copy.secondaryTitle || (ko ? "더 살펴보기." : "More to explore."))}</h2>
      </div>
    </header>
    <div class="rx-secondary__grid">${secondaryCards}</div>
  </div>
</section>`
    : ""
}

<section class="rx-nl" data-rs-reveal aria-labelledby="rx-nl-title">
  <div class="rx-shell rx-nl__layout">
    <div>
      <p class="rx-nl__kicker">${escapeHtml(copy.nlEyebrow || "NEWON NOTES")}</p>
      <h2 class="rx-nl__title" id="rx-nl-title">${escapeHtml(copy.nlTitle || (ko ? "새로운 실험과 제품 이야기를 받아보세요." : "Get new experiments and product notes."))}</h2>
      <p class="rx-nl__lead">${escapeHtml(copy.nlLead || (ko ? "Newon의 새로운 제품, 실험과 배운 점을 가끔 보내드립니다." : "Occasional notes on products, experiments, and what we learn."))}</p>
    </div>
    <div>
      <form class="rx-nl__form waitlist-form nw-notify-form" data-waitlist-form data-form-type="newsletter" data-product-id="newsletter">
        <input type="hidden" name="productId" value="newsletter" />
        <div class="nw-notify-form__row">
          <label class="visually-hidden" for="rx-nl-email">Email</label>
          <input id="rx-nl-email" type="email" name="email" class="nw-notify-form__email" required autocomplete="email" placeholder="${escapeHtml(copy.nlPlaceholder || nlCopy.formPlaceholder || "your@email.com")}" />
          <button type="submit" class="nw-notify-form__btn">${escapeHtml(copy.nlCta || (ko ? "구독하기 →" : "Subscribe →"))}</button>
        </div>
        <input type="text" name="_honey" class="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
      </form>
      <p class="rs-form__msg" data-waitlist-success hidden>${escapeHtml(nlCopy.success || "")}</p>
      <p class="rs-form__msg" data-waitlist-duplicate hidden>${escapeHtml(nlCopy.duplicate || "")}</p>
      <p class="rs-form__msg rs-form__msg--error" data-waitlist-error hidden role="alert">${escapeHtml(nlCopy.error || "")}</p>
      <p class="rx-nl__note">${escapeHtml(copy.nlNote || (ko ? "스팸 없이, 필요한 이야기만." : "No spam — only what matters."))}</p>
    </div>
  </div>
</section>`;
}
