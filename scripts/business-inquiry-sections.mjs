/**
 * /{lang}/business/inquiry/ — fills templates/business-inquiry.html with the Business Inquiry copy.
 * Markup reuses the page's existing components only (bz-cap-grid, bz-card, bz-why-card, bz-process,
 * bz-faq, bz-field, bz-rep); no new classes or styles.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { INQ_TYPES, INQ_PLATFORMS, INQ_PLATFORM_EXTRA, inquiryCopy, inquiryTypeAliasMap } from "./business-inquiry-copy.mjs";

const pad = (n) => String(n).padStart(2, "0");

function catsHtml(c) {
  return c.cats
    .map(
      (it, i) => `            <li class="bz-cap-item">
              <span class="bz-cap-item__n">${pad(i + 1)}</span>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.body)}</p>
              <p class="bz-cap-item__keys">${escapeHtml(it.keys)}</p>
            </li>`
    )
    .join("\n");
}

function platsHtml(c) {
  return INQ_PLATFORMS.map(
    (p) => `            <a class="bz-card" href="../../${p.href}">
              <h3>${escapeHtml(p.name)}</h3>
              <p>${escapeHtml(c.plats[p.id])}</p>
              <span class="bz-card__more">${escapeHtml(c.platMore)}</span>
            </a>`
  ).join("\n");
}

function whoHtml(c) {
  return c.who
    .map(
      (it, i) => `            <li class="bz-why-card">
              <span class="bz-num">${pad(i + 1)}</span>
              <h3>${escapeHtml(it.title)}</h3>
              <p>${escapeHtml(it.body)}</p>
            </li>`
    )
    .join("\n");
}

function stepsHtml(c) {
  return c.steps
    .map(
      (it, i) => `            <li>
              <span class="bz-process__n" aria-hidden="true">${pad(i + 1)}</span>
              <div class="bz-process__body">
                <h3 class="bz-process__en">${escapeHtml(it.title)}</h3>
                <p class="bz-process__ko">${escapeHtml(it.body)}</p>
              </div>
            </li>`
    )
    .join("\n");
}

function faqHtml(c) {
  return c.faq
    .map(
      (it) => `            <div class="bz-faq-item">
              <button type="button" class="bz-faq-q" aria-expanded="false">
                <span>${escapeHtml(it.q)}</span>
                <span class="bz-faq-icon" aria-hidden="true"></span>
              </button>
              <div class="bz-faq-a"><p>${escapeHtml(it.a)}</p></div>
            </div>`
    )
    .join("\n");
}

function typeOptionsHtml(c) {
  return INQ_TYPES.map(
    (t) => `                <option value="${escapeHtml(t.value)}" data-slug="${t.key}">${escapeHtml(c.types[t.key])}</option>`
  ).join("\n");
}

function platformOptionsHtml(c) {
  const main = INQ_PLATFORMS.map((p) => `                <option value="${escapeHtml(p.value)}">${escapeHtml(p.name)}</option>`);
  const extra = INQ_PLATFORM_EXTRA.map(
    (p) => `                <option value="${escapeHtml(p.value)}">${escapeHtml(c.platformExtra[p.id])}</option>`
  );
  return [...main, ...extra].join("\n");
}

function platformMap() {
  const map = {};
  for (const p of [...INQ_PLATFORMS, ...INQ_PLATFORM_EXTRA]) {
    map[p.id] = p.value;
    map[p.value] = p.value;
    map[p.value.toLowerCase()] = p.value;
  }
  return map;
}

/** Inline JSON inside <script>: escape "<" so no value can close the tag. */
const scriptJson = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

export function fillBusinessInquiry(html, lang) {
  const { c, fallback } = inquiryCopy(lang);
  const lists = {
    INQ_HERO_DOMAINS: c.heroDomains.map((d) => `                <li>${escapeHtml(d)}</li>`).join("\n"),
    INQ_CATS: catsHtml(c),
    INQ_PLATS: platsHtml(c),
    INQ_WHO: whoHtml(c),
    INQ_STEPS: stepsHtml(c),
    INQ_STEP_COUNT: pad(c.steps.length),
    INQ_FAQ: faqHtml(c),
    INQ_TYPE_OPTIONS: typeOptionsHtml(c),
    INQ_PLATFORM_OPTIONS: platformOptionsHtml(c),
    INQ_TYPE_MAP_JSON: scriptJson(inquiryTypeAliasMap()),
    INQ_PLATFORM_MAP_JSON: scriptJson(platformMap()),
    INQ_MAIN_LANG: fallback ? ' lang="en"' : "",
  };
  let out = html.replace(/\{\{(INQ_[A-Z_]+)\}\}/g, (all, k) => {
    if (!(k in lists)) throw new Error(`business inquiry: unknown placeholder ${all}`);
    return lists[k];
  });
  out = out.replace(/\{\{INQ(_HTML|_JS)?:([A-Za-z0-9]+)\}\}/g, (all, kind, key) => {
    const v = c[key];
    if (typeof v !== "string") throw new Error(`business inquiry: missing copy "${key}"`);
    if (kind === "_HTML") return v;
    if (kind === "_JS") return JSON.stringify(v);
    return escapeHtml(v);
  });
  return out;
}
