/**
 * Newon Tools hub + detail — clean utility directory.
 */
import { TOOLS, TOOL_FILTERS, quickAccessTools, relatedTools } from "./tools-data.mjs";
import { escapeHtml, pick } from "./hub-utils.mjs";

function t(flat, flatEn, key, fb = "") {
  const v = pick(flat, flatEn, key);
  return escapeHtml(v != null && v !== "" ? String(v) : fb);
}

const ICONS = {
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zm5 0h2v2h-2zm-5 5h2v2h-2zm3 3h5v-5"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  aperture: '<circle cx="12" cy="12" r="9"/><path d="M14.3 3.3 12 12l7.7 2.3M9.7 20.7 12 12 4.3 9.7M3.3 9.7 12 12l2.3-7.7M20.7 14.3 12 12l-2.3 7.7"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  type: '<path d="M4 7V5h16v2M9 20h6M12 5v15"/>',
  key: '<circle cx="7.5" cy="15.5" r="3.5"/><path d="M11 14h9v3h-2v2h-2v-2h-2"/>',
  fingerprint: '<path d="M12 11a4 4 0 0 1 4 4v3M8 15v-1a4 4 0 0 1 8 0M6 15v-1a6 6 0 0 1 12 0v1M4 15v-1a8 8 0 0 1 16 0"/>',
  braces: '<path d="M8 4H6a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2"/>',
  pipette: '<path d="m2 22 1-1h3l9-9M10 6l8 8M14 3l7 7-4 4-7-7z"/>',
  percent: '<path d="M19 5 5 19M7.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM8 8h8M8 12h8M8 16h5"/>',
  "calendar-range": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M10 16h4"/>',
};

function iconSvg(name, size = 22) {
  const path = ICONS[name] || ICONS.qr;
  return `<svg class="tools-icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function searchIndexJson(flat, flatEn) {
  const rows = TOOLS.map((tool) => {
    const name = pick(flat, flatEn, tool.nameKey) || tool.slug;
    const desc = pick(flat, flatEn, tool.descKey) || "";
    const keywords = (tool.keywords || []).join(" ");
    return {
      slug: tool.slug,
      href: `${tool.slug}/`,
      name,
      desc,
      filters: tool.filters || [],
      search: `${name} ${desc} ${keywords} ${tool.slug} ${tool.tag || ""}`.toLowerCase(),
    };
  });
  return JSON.stringify(rows).replace(/</g, "\\u003c");
}

function quickAccessBlock(flat, flatEn) {
  const blurbs = {
    qr: t(flat, flatEn, "studio.toolsQuickQr", "빠르게 QR 만들기"),
    dday: t(flat, flatEn, "studio.toolsQuickDday", "날짜까지 남은 시간 계산"),
    password: t(flat, flatEn, "studio.toolsQuickPassword", "안전한 비밀번호 생성"),
  };
  const shortNames = {
    qr: t(flat, flatEn, "studio.toolsQuickQrName", "QR Code"),
    dday: t(flat, flatEn, "studio.toolsQuickDdayName", "D-Day"),
    password: t(flat, flatEn, "studio.toolsQuickPasswordName", "Password"),
  };
  return quickAccessTools()
    .map((tool) => {
      return `<a class="tools-quick__card" href="${escapeHtml(tool.slug)}/">
      <span class="tools-quick__icon">${iconSvg(tool.icon, 20)}</span>
      <span class="tools-quick__copy">
        <strong>${shortNames[tool.slug] || t(flat, flatEn, tool.nameKey)}</strong>
        <em>${blurbs[tool.slug] || t(flat, flatEn, tool.descKey)}</em>
      </span>
      <span class="tools-quick__arrow" aria-hidden="true">→</span>
    </a>`;
    })
    .join("\n");
}

function toolCard(tool, flat, flatEn) {
  const name = t(flat, flatEn, tool.nameKey);
  const desc = t(flat, flatEn, tool.descKey);
  const filters = (tool.filters || []).join(" ");
  const keywords = (tool.keywords || []).join(" ");
  const search = `${name} ${desc} ${keywords} ${tool.slug} ${tool.tag || ""}`.toLowerCase();
  const group = t(flat, flatEn, tool.groupKey || "studio.toolsGroupFree", "무료");
  const free = t(flat, flatEn, "studio.toolsFree", "무료");
  return `<a class="tools-card" href="${escapeHtml(tool.slug)}/" data-tool-item data-tool-slug="${escapeHtml(tool.slug)}" data-tool-filters="${escapeHtml(filters)}" data-tool-search="${escapeHtml(search)}">
    <span class="tools-card__top">
      <span class="tools-card__icon" aria-hidden="true">${iconSvg(tool.icon, 22)}</span>
      <span class="tools-card__go" aria-hidden="true">↗</span>
    </span>
    <span class="tools-card__body">
      <span class="tools-card__name">${name}</span>
      <span class="tools-card__desc">${desc}</span>
    </span>
    <span class="tools-card__foot">${group} · ${free}</span>
  </a>`;
}

function commandVisual(flat, flatEn) {
  const rows = [
    { slug: "qr", name: t(flat, flatEn, "studio.toolQrName", "QR Code Generator") },
    { slug: "dday", name: t(flat, flatEn, "studio.toolDdayName", "D-Day Calculator") },
    { slug: "password", name: t(flat, flatEn, "studio.toolPasswordName", "Password Generator") },
  ]
    .map(
      (r) =>
        `<button type="button" class="tools-cmd__row" data-cmd-focus data-cmd-query="${escapeHtml(r.name)}"><span>${r.name}</span><i aria-hidden="true">↵</i></button>`
    )
    .join("");
  return `<aside class="tools-cmd" aria-hidden="true">
    <div class="tools-cmd__bar">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <span>${t(flat, flatEn, "studio.toolsCmdHint", "Search tools")}</span>
      <kbd>⌘ K</kbd>
    </div>
    <div class="tools-cmd__list">${rows}</div>
  </aside>`;
}

export function renderToolsShowcaseBody(flat, flatEn) {
  const count = String(TOOLS.length);
  const filters = TOOL_FILTERS.map(
    (f) =>
      `<button type="button" class="tools-filter${f.id === "all" ? " is-active" : ""}" data-tools-filter="${escapeHtml(f.id)}" aria-pressed="${f.id === "all" ? "true" : "false"}">${t(flat, flatEn, f.labelKey, f.labelEn)}</button>`
  ).join("");

  const cards = TOOLS.map((tool) => toolCard(tool, flat, flatEn)).join("\n");

  return `<div class="tools-page" data-tools-page>
  <script type="application/json" id="tools-search-index">${searchIndexJson(flat, flatEn)}</script>

  <section class="tools-hero">
    <div class="tools-hero__inner hub-inner">
      <div class="tools-hero__copy">
        <p class="tools-hero__eyebrow">${t(flat, flatEn, "studio.toolsHeroLabel", "NEWON TOOLS")}</p>
        <h1 class="tools-hero__title">${t(flat, flatEn, "studio.toolsHeroTitle", "필요한 순간, 바로 꺼내 쓰는 도구.")}</h1>
        <p class="tools-hero__lead">${t(flat, flatEn, "studio.toolsHeroLead", "계산, 변환, 생성, 개발까지. 설치 없이 브라우저에서 바로 사용할 수 있습니다.")}</p>

        <div class="tools-search" data-tools-search-root>
          <label class="tools-search__shell" for="tools-search-input">
            <svg class="tools-search__loupe" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input id="tools-search-input" type="search" class="tools-search__input" data-tools-search autocomplete="off" spellcheck="false" placeholder="${t(flat, flatEn, "studio.toolsSearchPlaceholder", "도구 검색")}" aria-label="${t(flat, flatEn, "studio.toolsSearchAria", "도구 검색")}" aria-controls="tools-search-results" aria-expanded="false" />
            <kbd class="tools-search__kbd" data-tools-kbd>⌘ K</kbd>
          </label>
          <div class="tools-search__panel" id="tools-search-results" data-tools-results hidden role="listbox" aria-label="${t(flat, flatEn, "studio.toolsSearchResults", "검색 결과")}" data-empty-msg="${t(flat, flatEn, "studio.toolsEmpty", "검색 결과가 없습니다.\n다른 검색어를 입력해보세요.")}"></div>
        </div>
      </div>
      ${commandVisual(flat, flatEn)}
    </div>
  </section>

  <section class="tools-toolbar hub-inner">
    <div class="tools-filters" role="toolbar" aria-label="${t(flat, flatEn, "studio.toolsFiltersAria", "도구 카테고리")}">
      ${filters}
    </div>
  </section>

  <section class="tools-quick hub-inner" data-tools-reveal>
    <header class="tools-section-head tools-section-head--row">
      <div>
        <p class="tools-section-head__eyebrow">${t(flat, flatEn, "studio.toolsQuickLabel", "QUICK ACCESS")}</p>
        <h2 class="tools-section-head__title">${t(flat, flatEn, "studio.toolsQuickTitle", "빠른 실행")}</h2>
      </div>
    </header>
    <div class="tools-quick__grid">${quickAccessBlock(flat, flatEn)}</div>
  </section>

  <section id="all-tools" class="tools-all hub-inner" data-tools-reveal>
    <header class="tools-section-head tools-section-head--row">
      <div>
        <p class="tools-section-head__eyebrow">${t(flat, flatEn, "studio.toolsAllLabel", "ALL TOOLS")}</p>
        <h2 class="tools-section-head__title">${t(flat, flatEn, "studio.toolsAllTitle", "모든 도구")}</h2>
      </div>
      <p class="tools-all__count" data-tools-count data-count-suffix="${t(flat, flatEn, "studio.toolsCountSuffix", "TOOLS")}" data-count-sep="${t(flat, flatEn, "studio.toolsCountSep", "·")}"><span data-count-label>${t(flat, flatEn, "studio.toolsAllLabel", "ALL TOOLS")}</span> <span data-count-sep aria-hidden="true">·</span> <strong data-count-num>${escapeHtml(count)}</strong></p>
    </header>
    <div class="tools-grid" data-tools-grid>${cards}</div>
    <p class="tools-empty" data-tools-empty hidden>${t(flat, flatEn, "studio.toolsEmpty", "검색 결과가 없습니다.\n다른 검색어를 입력해보세요.")}</p>
  </section>

  <section class="tools-cta" data-tools-reveal>
    <div class="tools-cta__inner hub-inner">
      <p class="tools-cta__eyebrow">${t(flat, flatEn, "studio.toolsCtaLabel", "NEWON TOOLS")}</p>
      <h2 class="tools-cta__title">${t(flat, flatEn, "studio.toolsCtaTitle", "필요한 도구가 없나요?")}</h2>
      <p class="tools-cta__lead">${t(flat, flatEn, "studio.toolsCtaLead", "Newon에 필요한 도구를 알려주세요. 새로운 Tool 아이디어를 받고 있습니다.")}</p>
      <a class="btn btn-primary tools-cta__btn" href="../ideas/">${t(flat, flatEn, "studio.toolsCtaIdea", "도구 제안하기")} →</a>
    </div>
  </section>
</div>`;
}

export function renderToolDetailBody(tool, flat, flatEn) {
  const name = t(flat, flatEn, tool.nameKey);
  const desc = t(flat, flatEn, tool.descKey);
  const how = (tool.howKeys || [])
    .map((key, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `<li><span>${n}</span><p>${t(flat, flatEn, key, "")}</p></li>`;
    })
    .join("");

  const relatedHtml = relatedTools(tool, 3)
    .map(
      (x) => `<a class="tools-related__item" href="../${escapeHtml(x.slug)}/">
      <span class="tools-related__icon">${iconSvg(x.icon, 20)}</span>
      <span>
        <strong>${t(flat, flatEn, x.nameKey)}</strong>
        <em>${t(flat, flatEn, x.descKey)}</em>
      </span>
      <i aria-hidden="true">↗</i>
    </a>`
    )
    .join("");

  const privacy = tool.clientSide
    ? `<p class="tools-detail__privacy">${t(flat, flatEn, "studio.toolsRunsLocal", "입력한 데이터는 브라우저에서 처리됩니다.")}</p>`
    : `<p class="tools-detail__privacy">${t(flat, flatEn, "studio.toolsQrNote", "QR 이미지는 생성 API를 통해 만들어집니다.")}</p>`;

  return `<div class="tools-detail" data-tools-detail data-tool-slug="${escapeHtml(tool.slug)}">
  <div class="hub-inner">
    <nav class="tools-crumb" aria-label="Breadcrumb">
      <a href="../">${t(flat, flatEn, "studio.toolsCrumbRoot", "Newon Tools")}</a>
      <span aria-hidden="true">/</span>
      <span>${name}</span>
    </nav>

    <a class="tools-detail__back" href="../">${t(flat, flatEn, "studio.toolsBack", "← 모든 도구")}</a>

    <header class="tools-detail__head">
      <span class="tools-detail__icon">${iconSvg(tool.icon, 28)}</span>
      <div>
        <p class="tools-detail__tag">${escapeHtml(tool.tag || "")}</p>
        <h1 class="tools-detail__title">${name}</h1>
        <p class="tools-detail__lead">${desc}</p>
        ${privacy}
      </div>
    </header>

    <section class="tools-detail__workspace">
      <div class="tool-panel tools-workspace" data-tool-id="${escapeHtml(tool.id)}">
        <div data-tool-mount="${escapeHtml(tool.slug)}"></div>
      </div>
    </section>

    <section class="tools-detail__how">
      <h2 class="tools-detail__h">${t(flat, flatEn, "studio.toolsHowLabel", "사용 방법")}</h2>
      <ol class="tools-detail__steps">${how}</ol>
    </section>

    <section class="tools-detail__related">
      <h2 class="tools-detail__h">${t(flat, flatEn, "studio.toolsRelatedLabel", "RELATED TOOLS")}</h2>
      <p class="tools-detail__related-lead">${t(flat, flatEn, "studio.toolsRelatedLead", "이 도구와 함께 사용해보세요.")}</p>
      <div class="tools-related">${relatedHtml}</div>
    </section>
  </div>
  <div class="tools-toast" data-tools-toast hidden role="status" aria-live="polite"></div>
</div>`;
}
