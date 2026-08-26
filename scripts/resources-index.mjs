/**
 * Resources INDEX only — /{lang}/resources/
 * Other hubs (store/blog/labs/…) are untouched by this module.
 */
import { RESOURCE_PAGES } from "./resources-catalog.mjs";
import {
  getFeaturedStoreProducts,
  getLabsExperiments,
  getPublishedBlogPosts,
  getPublishedMediaItems,
  getStoreProducts,
  buildSearchIndex,
} from "./resources-data.mjs";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function sortKey(isoOrMonth) {
  const s = String(isoOrMonth || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  return "";
}

function displayDate(isoOrMonth) {
  const s = String(isoOrMonth || "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.replace(/-/g, ".");
  if (/^\d{4}-\d{2}$/.test(s)) return s.replace("-", ".");
  return "";
}

function labTags(e) {
  const cat = String(e.category || "").toUpperCase();
  const tags = ["Experiment"];
  if (cat.includes("AI") || /ai/i.test(e.slug || "")) tags.unshift("AI");
  if (cat.includes("PRODUCT") || cat.includes("SAAS")) tags.push("Product");
  if (cat.includes("GAME")) tags.push("Game");
  return [...new Set(tags)].slice(0, 3);
}

function storeTags(p) {
  const tags = [];
  if (p.category) tags.push(String(p.category));
  tags.push("Store");
  return tags.slice(0, 3);
}

function topicHay(...parts) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function cardVisual(slug) {
  switch (slug) {
    case "store":
      return `<div class="rh-viz rh-viz--store" aria-hidden="true">
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
        <span class="rh-viz__doc"></span><span class="rh-viz__doc"></span>
      </div>`;
    case "blog":
      return `<div class="rh-viz rh-viz--blog" aria-hidden="true">
        <span><i>01</i><b></b></span>
        <span><i>02</i><b></b></span>
        <span><i>03</i><b></b></span>
      </div>`;
    case "media":
      return `<div class="rh-viz rh-viz--media" aria-hidden="true">
        <div class="rh-viz__play"><i></i></div>
      </div>`;
    case "labs":
      return `<div class="rh-viz rh-viz--labs" aria-hidden="true">
        <span>TEST</span><span>BUILD</span><span>LEARN</span><span>REPEAT</span>
      </div>`;
    case "newsletter":
      return `<div class="rh-viz rh-viz--news" aria-hidden="true">
        <p>ISSUE</p>
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

/**
 * @param {{ escapeHtml: Function, brHeadline: Function, resourceSwitcher: Function, tField: Function }} ctx
 */
export function buildResourcesIndexBody(copies, lang, ctx) {
  const { escapeHtml, brHeadline, resourceSwitcher, tField } = ctx;
  const copy = copies.index;
  const nlCopy = copies.newsletter || {};
  const ko = lang === "ko";

  const process = (copy.heroProcess || [
    { n: "01", title: "BUILD", body: ko ? "아이디어를 제품으로" : "Idea → product" },
    { n: "02", title: "TEST", body: ko ? "사용자·데이터로 검증" : "Validate with users" },
    { n: "03", title: "LEARN", body: ko ? "결과에서 학습" : "Learn from outcomes" },
    { n: "04", title: "SHARE", body: ko ? "기록하고 공유" : "Record & share" },
    { n: "05", title: "BUILD AGAIN", body: ko ? "다음 빌드에 적용" : "Apply next" },
  ])
    .map(
      (s, i, arr) => `<li class="rx-rail__item">
      <span class="rx-rail__n" aria-hidden="true">${escapeHtml(s.n || pad2(i + 1))}</span>
      <span class="rx-rail__node" aria-hidden="true"></span>
      <div class="rx-rail__text">
        <strong>${escapeHtml(s.title)}</strong>
        <span>${escapeHtml(s.body || "")}</span>
      </div>
      ${i < arr.length - 1 ? `<span class="rx-rail__line" aria-hidden="true"></span>` : ""}
    </li>`
    )
    .join("");

  const featured = collectFeatured(lang, tField, escapeHtml, copy);
  const latest = collectLatest(lang, tField, escapeHtml, copy);

  /* Original black-grid explore cards (categories only) */
  const exploreCards = RESOURCE_PAGES.map((p, i) => {
    const item = copy.indexItems?.[p.slug] || {};
    const n = pad2(i + 1);
    const featured = p.slug === "labs";
    const cls = `rh-card rh-card--${escapeHtml(p.slug)}${featured ? " is-featured" : ""}`;
    const head = `<div class="rh-card__head">
        <span class="rh-card__num" aria-hidden="true">${n}</span>
        <span class="rh-card__cat">${escapeHtml(item.category || "")}</span>
      </div>
      <h3 class="rh-card__title">${escapeHtml(item.title || p.slug.toUpperCase())}</h3>
      <p class="rh-card__lead">${brHeadline(item.lead || item.desc || "")}</p>
      ${item.desc && item.lead && item.desc !== item.lead ? `<p class="rh-card__desc">${escapeHtml(item.desc)}</p>` : ""}
      ${
        item.meta
          ? `<div class="rh-card__meta">
        <span>${escapeHtml(item.meta)}</span>
        ${item.metaSub ? `<span class="rh-card__meta-sub">${escapeHtml(item.metaSub)}</span>` : ""}
      </div>`
          : ""
      }`;

    if (p.slug === "newsletter") {
      return `<article class="${cls}" data-rs-reveal>
      ${head}
      <div class="rh-card__foot">
        <form class="rh-card__form waitlist-form" data-waitlist-form data-form-type="newsletter" data-product-id="newsletter" action="newsletter/">
          <input type="hidden" name="productId" value="newsletter" />
          <label class="visually-hidden" for="rh-nl-email">${escapeHtml(item.formPlaceholder || "Email")}</label>
          <input id="rh-nl-email" type="email" name="email" placeholder="${escapeHtml(item.formPlaceholder || nlCopy.formPlaceholder || "your@email.com")}" required autocomplete="email" />
          <button type="submit">${escapeHtml(item.formCta || (ko ? "구독하기 →" : "SUBSCRIBE →"))}</button>
          <input type="text" name="_honey" class="rs-hp" tabindex="-1" autocomplete="off" aria-hidden="true" />
        </form>
        <p class="rs-form__msg" data-waitlist-success hidden>${escapeHtml(nlCopy.success || "")}</p>
        <p class="rs-form__msg" data-waitlist-duplicate hidden>${escapeHtml(nlCopy.duplicate || "")}</p>
        <p class="rs-form__msg rs-form__msg--error" data-waitlist-error hidden role="alert">${escapeHtml(nlCopy.error || "")}</p>
        <a class="rh-card__cta" href="${escapeHtml(p.slug)}/">${escapeHtml(item.cta || (ko ? "뉴스레터 보기 ↗" : "EXPLORE NEWSLETTER ↗"))}</a>
      </div>
      ${cardVisual(p.slug)}
    </article>`;
    }

    return `<a class="${cls}" href="${escapeHtml(p.slug)}/" data-rs-reveal>
      ${head}
      <span class="rh-card__cta">${escapeHtml(item.cta || (ko ? "둘러보기 ↗" : "EXPLORE ↗"))}</span>
      ${cardVisual(p.slug)}
    </a>`;
  }).join("\n");

  const whySteps = (copy.whySteps || copy.heroProcess || [])
    .map(
      (s, i, arr) => `<li class="rx-why__step">
      <span class="rx-why__n">${escapeHtml(s.n || pad2(i + 1))}</span>
      <div class="rx-why__copy">
        <strong>${escapeHtml(s.title)}</strong>
        <p>${escapeHtml(s.body || "")}</p>
      </div>
      ${i < arr.length - 1 ? `<span class="rx-why__arrow" aria-hidden="true">↓</span>` : ""}
    </li>`
    )
    .join("");

  const topics = (copy.topics || [
    "AI",
    "App Development",
    "Product",
    "Design",
    "Growth",
    "Startup",
    "Experiment",
    "Game",
    "Marketing",
    "Analytics",
  ])
    .map(
      (t) =>
        `<button type="button" class="rx-chip" data-rx-topic="${escapeHtml(String(t).toLowerCase())}">${escapeHtml(t)}</button>`
    )
    .join("");

  const filters = ["all", ...RESOURCE_PAGES.map((p) => p.slug)]
    .map((slug) => {
      const label =
        slug === "all"
          ? copy.searchFilterAll || (ko ? "전체" : "All")
          : copies[slug]?.navLabel || slug.toUpperCase();
      return `<button type="button" class="rx-filter${slug === "all" ? " is-on" : ""}" data-rx-type="${escapeHtml(slug)}">${escapeHtml(label)}</button>`;
    })
    .join("");

  const searchItems = buildSearchIndex(lang);
  const searchJson = escapeHtml(JSON.stringify(searchItems));
  const suggest = searchItems
    .slice(0, 3)
    .map(
      (it) =>
        `<a class="rx-suggest" href="${escapeHtml(it.url)}"><em>${escapeHtml(String(it.type || "").toUpperCase())}</em><strong>${escapeHtml(it.title)}</strong></a>`
    )
    .join("");

  return `${resourceSwitcher("index", copies, "")}

<section class="rx-hero" data-rs-reveal aria-labelledby="rs-hero-title">
  <div class="rx-shell rx-hero__layout">
    <div class="rx-hero__copy">
      <p class="rx-kicker">${escapeHtml(copy.eyebrow || "NEWON RESOURCES")}</p>
      <h1 class="rx-hero__title" id="rs-hero-title">${brHeadline(copy.headline)}</h1>
      <p class="rx-hero__lead">${escapeHtml(copy.lead || "")}</p>
      ${copy.heroSub ? `<p class="rx-hero__note">${escapeHtml(copy.heroSub)}</p>` : ""}
      <div class="rx-hero__cta">
        <a class="rx-btn rx-btn--fill" href="#rx-cats">${escapeHtml(copy.ctaBrowse || (ko ? "리소스 둘러보기 →" : "Browse resources →"))}</a>
        <a class="rx-btn rx-btn--line" href="labs/">${escapeHtml(copy.ctaLabs || (ko ? "Labs 보기 ↗" : "View Labs ↗"))}</a>
      </div>
    </div>
    <aside class="rx-rail" aria-label="${escapeHtml(copy.heroProcessLabel || "PROCESS")}">
      <p class="rx-rail__label">${escapeHtml(copy.heroProcessLabel || "PROCESS")}</p>
      <ol class="rx-rail__list">${process}</ol>
    </aside>
  </div>
</section>

${
  featured.length
    ? `<section class="rx-block rx-featured" data-rs-reveal aria-labelledby="rx-feat-title">
  <div class="rx-shell">
    <header class="rx-feat-head">
      <div>
        <p class="rx-kicker">${escapeHtml(copy.featuredEyebrow || "FEATURED")}</p>
        <h2 class="rx-h2" id="rx-feat-title">${brHeadline(copy.featuredTitle || "")}</h2>
        ${copy.featuredLead ? `<p class="rx-sub">${escapeHtml(copy.featuredLead)}</p>` : ""}
      </div>
      <a class="rx-link" href="labs/">${escapeHtml(copy.featuredMore || (ko ? "Labs 전체 보기 →" : "All Labs →"))}</a>
    </header>
    <div class="rx-feat-board">${featured.join("")}</div>
  </div>
</section>`
    : ""
}

<section class="rs-section rh-explore" id="rx-cats" aria-labelledby="rh-explore-title">
  <div class="rx-shell">
    <header class="rh-explore__head">
      <div class="rh-explore__copy">
        <p class="rs-eyebrow">${escapeHtml(copy.sectionIndex || (ko ? "탐색" : "EXPLORE"))}</p>
        <h2 class="rh-explore__title" id="rh-explore-title">${escapeHtml(copy.sectionIndexTitle || "Resources")}</h2>
      </div>
      <p class="rh-explore__count">
        <span class="rh-explore__count-k">${escapeHtml(copy.indexCountLabel || (ko ? "목록" : "INDEX"))}</span>
        <span class="rh-explore__count-n">${escapeHtml(copy.sectionIndexRange || "01—06")}</span>
      </p>
    </header>
    <div class="rh-grid">${exploreCards}</div>
  </div>
</section>

${
  latest.length
    ? `<section class="rx-block rx-latest" id="rx-latest" data-rs-reveal aria-labelledby="rx-latest-title">
  <div class="rx-shell">
    <header class="rx-head rx-head--split">
      <div>
        <p class="rx-kicker">${escapeHtml(copy.latestEyebrow || "LATEST FROM NEWON")}</p>
        <h2 class="rx-h2" id="rx-latest-title">${brHeadline(copy.latestTitle || "")}</h2>
      </div>
      <a class="rx-link" href="#rx-cats">${escapeHtml(copy.latestViewAll || (ko ? "전체 리소스 보기 →" : "View all →"))}</a>
    </header>
    <ol class="rx-list" data-rx-latest>${latest.join("")}</ol>
  </div>
</section>`
    : ""
}

<section class="rx-why" data-rs-reveal aria-labelledby="rx-why-title">
  <div class="rx-shell rx-why__layout">
    <div class="rx-why__left">
      <p class="rx-why__kicker">${escapeHtml(copy.whyEyebrow || "WHY RESOURCES")}</p>
      <h2 class="rx-why__title" id="rx-why-title">${brHeadline(copy.whyTitle || "")}</h2>
      <p class="rx-why__lead">${escapeHtml(copy.whyLead || "")}</p>
    </div>
    <ol class="rx-why__steps" aria-label="Build loop">${whySteps}</ol>
  </div>
</section>

<section class="rx-block rx-discover" data-rs-reveal aria-labelledby="rx-topics-title">
  <div class="rx-shell">
    <header class="rx-head">
      <div>
        <p class="rx-kicker">${escapeHtml(copy.topicsEyebrow || "EXPLORE BY TOPIC")}</p>
        <h2 class="rx-h2" id="rx-topics-title">${escapeHtml(copy.topicsTitle || (ko ? "관심 있는 주제부터." : "Start with a topic."))}</h2>
      </div>
    </header>
    <div class="rx-chips" role="group" aria-label="Topics" data-rx-topics>${topics}</div>
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

<section class="rx-nl" data-rs-reveal aria-labelledby="rx-nl-title">
  <div class="rx-shell rx-nl__layout">
    <div>
      <p class="rx-nl__kicker">${escapeHtml(copy.nlEyebrow || "NEWON NOTES")}</p>
      <h2 class="rx-nl__title" id="rx-nl-title">${escapeHtml(copy.nlTitle || (ko ? "새로운 실험과 제품 이야기를 받아보세요." : "Get new experiments and product notes."))}</h2>
      <p class="rx-nl__lead">${escapeHtml(copy.nlLead || (ko ? "Newon의 새로운 제품, 실험과 배운 점을 가끔 보내드립니다." : "Occasional notes on products, experiments, and what we learn."))}</p>
    </div>
    <div>
      <form class="rx-nl__form waitlist-form" data-waitlist-form data-form-type="newsletter" data-product-id="newsletter">
        <input type="hidden" name="productId" value="newsletter" />
        <label class="visually-hidden" for="rx-nl-email">Email</label>
        <input id="rx-nl-email" type="email" name="email" required autocomplete="email" placeholder="${escapeHtml(copy.nlPlaceholder || nlCopy.formPlaceholder || "your@email.com")}" />
        <button type="submit">${escapeHtml(copy.nlCta || (ko ? "구독하기 →" : "Subscribe →"))}</button>
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

function collectFeatured(lang, tField, escapeHtml, copy) {
  const labs = [...getLabsExperiments()].sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
  );
  const stores = getFeaturedStoreProducts(3);
  const ko = lang === "ko";
  const pool = [];

  if (labs[0]) {
    pool.push({
      type: "LABS",
      date: displayDate(labs[0].updatedAt),
      title: tField(labs[0], lang, "titleKo", "titleEn"),
      desc: tField(labs[0], lang, "descKo", "descEn"),
      href: `labs/${labs[0].slug}/`,
      tags: labTags(labs[0]),
      viz: "bars",
      badge: ko ? "LIVE" : "LIVE",
    });
  }
  if (stores[0]) {
    pool.push({
      type: "STORE",
      date: displayDate(stores[0].updated),
      title: tField(stores[0], lang, "titleKo", "titleEn"),
      desc: tField(stores[0], lang, "descKo", "descEn"),
      href: `store/${stores[0].slug}/`,
      tags: storeTags(stores[0]),
      viz: "stack",
      badge: "KIT",
    });
  }
  if (labs[1]) {
    pool.push({
      type: "LABS",
      date: displayDate(labs[1].updatedAt),
      title: tField(labs[1], lang, "titleKo", "titleEn"),
      desc: tField(labs[1], lang, "descKo", "descEn"),
      href: `labs/${labs[1].slug}/`,
      tags: labTags(labs[1]),
      viz: "grid",
      badge: "LAB",
    });
  }

  return pool.slice(0, 3).map((item, i) =>
    featCard({ escapeHtml, copy, ...item, large: i === 0, n: pad2(i + 1) })
  );
}

function vizMarkup(kind) {
  if (kind === "stack") {
    return `<div class="rx-viz rx-viz--stack" aria-hidden="true"><i></i><i></i><i></i></div>`;
  }
  if (kind === "grid") {
    return `<div class="rx-viz rx-viz--grid" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`;
  }
  return `<div class="rx-viz rx-viz--bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>`;
}

function featCard({ escapeHtml, copy, type, date, title, desc, href, tags, large, n, viz, badge }) {
  const tagHtml = (tags || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("");
  const badgeHtml = badge ? `<span class="rx-card__badge">${escapeHtml(badge)}</span>` : "";
  if (large) {
    return `<a class="rx-spot" href="${escapeHtml(href)}">
      <div class="rx-spot__copy">
        <div class="rx-spot__meta">
          <span class="rx-spot__n" aria-hidden="true">${escapeHtml(n)}</span>
          ${badgeHtml}
          <span class="rx-spot__type">${escapeHtml(type)}${date ? ` · ${escapeHtml(date)}` : ""}</span>
        </div>
        <h3 class="rx-spot__title">${escapeHtml(title)}</h3>
        ${desc ? `<p class="rx-spot__desc">${escapeHtml(desc)}</p>` : ""}
        <div class="rx-spot__foot">
          ${tagHtml ? `<div class="rx-card__tags">${tagHtml}</div>` : "<span></span>"}
          <span class="rx-spot__cta">${escapeHtml(copy.featuredCta || copy.featuredView || "Explore ↗")}</span>
        </div>
      </div>
      <div class="rx-spot__panel" aria-hidden="true">${vizMarkup(viz)}</div>
    </a>`;
  }
  return `<a class="rx-mini" href="${escapeHtml(href)}">
    <div class="rx-mini__top">
      <span class="rx-mini__n" aria-hidden="true">${escapeHtml(n)}</span>
      ${badgeHtml}
      <span class="rx-mini__type">${escapeHtml(type)}${date ? ` · ${escapeHtml(date)}` : ""}</span>
    </div>
    <h3 class="rx-mini__title">${escapeHtml(title)}</h3>
    ${desc ? `<p class="rx-mini__desc">${escapeHtml(desc)}</p>` : ""}
    <span class="rx-mini__cta">${escapeHtml(copy.featuredCta || copy.featuredView || "Explore ↗")}</span>
    ${vizMarkup(viz)}
  </a>`;
}

function collectLatest(lang, tField, escapeHtml, copy) {
  const rows = [];

  for (const e of getLabsExperiments()) {
    const sk = sortKey(e.updatedAt);
    if (!sk) continue;
    const title = tField(e, lang, "titleKo", "titleEn");
    const desc = tField(e, lang, "descKo", "descEn");
    rows.push({
      sort: sk,
      type: "LABS",
      date: displayDate(e.updatedAt),
      title,
      desc,
      href: `labs/${e.slug}/`,
      topics: topicHay(...labTags(e), e.slug, e.category, "experiment", "labs"),
    });
  }
  for (const p of getStoreProducts()) {
    const sk = sortKey(p.updated);
    if (!sk) continue;
    const title = tField(p, lang, "titleKo", "titleEn");
    const desc = tField(p, lang, "descKo", "descEn");
    rows.push({
      sort: sk,
      type: "STORE",
      date: displayDate(p.updated),
      title,
      desc,
      href: `store/${p.slug}/`,
      topics: topicHay(...storeTags(p), p.slug, "store", "product", "startup"),
    });
  }
  for (const p of getPublishedBlogPosts()) {
    const raw = p.publishedAt || p.updatedAt || p.date;
    const sk = sortKey(raw);
    if (!sk) continue;
    rows.push({
      sort: sk,
      type: "BLOG",
      date: displayDate(raw),
      title: tField(p, lang, "titleKo", "titleEn"),
      desc: tField(p, lang, "descKo", "descEn"),
      href: `blog/${p.slug}/`,
      topics: topicHay("blog", "product", "writing"),
    });
  }
  for (const m of getPublishedMediaItems()) {
    const raw = m.publishedAt || m.updatedAt || m.date;
    const sk = sortKey(raw);
    if (!sk) continue;
    rows.push({
      sort: sk,
      type: "MEDIA",
      date: displayDate(raw),
      title: tField(m, lang, "titleKo", "titleEn"),
      desc: tField(m, lang, "descKo", "descEn"),
      href: `media/${m.slug}/`,
      topics: topicHay("media", "product"),
    });
  }

  rows.sort((a, b) => b.sort.localeCompare(a.sort));

  return rows.slice(0, 8).map((r, i) => {
    return `<li data-rx-row data-rx-topics="${escapeHtml(r.topics || "")}">
      <a class="rx-row" href="${escapeHtml(r.href)}">
        <span class="rx-row__n" aria-hidden="true">${pad2(i + 1)}</span>
        <span class="rx-row__type">${escapeHtml(r.type)}</span>
        <span class="rx-row__main">
          <span class="rx-row__title">${escapeHtml(r.title)}</span>
          ${r.desc ? `<span class="rx-row__desc">${escapeHtml(r.desc)}</span>` : ""}
        </span>
        <span class="rx-row__date">${r.date ? escapeHtml(r.date) : ""}</span>
        <span class="rx-row__go" aria-hidden="true">↗</span>
      </a>
    </li>`;
  });
}
