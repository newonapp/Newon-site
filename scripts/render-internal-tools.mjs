#!/usr/bin/env node
/**
 * Render /{lang}/business/internal-tools/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { LANGS, OG_LOCALE, SITE_ORIGIN, ROOT, escapeHtml, fontLinksHtml} from "./hub-utils.mjs";
import { injectSiteChrome } from "./inject-chrome.mjs";
import { getInternalToolsCopy } from "./internal-tools-copy.mjs";
import { BUSINESS_SERVICE_PAGES } from "./business-service-catalog.mjs";
import { getServiceCopy } from "./business-service-copy.mjs";

const template = fs.readFileSync(path.join(ROOT, "templates", "data-reporting.html"), "utf8");

function loadJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "locales", file), "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  if (obj == null) return out;
  if (typeof obj !== "object") {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => Object.assign(out, flatten(v, `${prefix}[${i}]`)));
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return out;
}

function br(s) {
  return escapeHtml(String(s || "")).replace(/\n/g, "<br />");
}

function hreflangBlock() {
  const lines = LANGS.map(
    ({ dir, hreflang }) =>
      `    <link rel="alternate" hreflang="${hreflang}" href="${SITE_ORIGIN}/${dir}/business/internal-tools/" />`
  );
  lines.push(
    `    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/business/internal-tools/" />`
  );
  return lines.join("\n");
}

function serviceNav(activeSlug, lang) {
  const copies = Object.fromEntries(
    BUSINESS_SERVICE_PAGES.map((p) => [p.slug, getServiceCopy(p.slug, lang)])
  );
  const links = BUSINESS_SERVICE_PAGES.map((s) => {
    const c = copies[s.slug];
    const label = escapeHtml(c?.navLabel || s.slug);
    const cls = s.slug === activeSlug ? "bs-nav__link is-active" : "bs-nav__link";
    const href = s.slug === activeSlug ? "#" : `../${s.slug}/`;
    return `<a class="${cls}" href="${href}"${s.slug === activeSlug ? ' aria-current="page"' : ""}>${label}</a>`;
  }).join("");
  return `<nav class="bs-nav" aria-label="Services"><div class="bs-inner bs-nav__inner"><p class="bs-nav__label">SERVICES</p><div class="bs-nav__track">${links}</div></div></nav>`;
}

function optionsHtml(list, placeholder) {
  const opts = (list || [])
    .map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`)
    .join("");
  return `<option value="">${escapeHtml(placeholder || "")}</option>${opts}`;
}

function checkGrid(namePrefix, items) {
  return `<div class="dr-checkgrid">${(items || [])
    .map((label, i) => {
      const id = `${namePrefix}-${i}`;
      const name = `${namePrefix}_${i}`;
      return `<label class="dr-check" for="${id}">
        <input id="${id}" name="${name}" type="checkbox" value="${escapeHtml(label)}" />
        <span>${escapeHtml(label)}</span>
      </label>`;
    })
    .join("")}</div>`;
}

function sectionHead(label, title, lead) {
  return `<div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(label)}</p>
    <h2 class="bs-title">${br(title)}</h2>
    ${lead ? `<p class="bs-lead">${escapeHtml(lead)}</p>` : ""}
  `;
}

function chips(list) {
  return `<div class="dr-chips">${(list || [])
    .map((s) => `<span class="dr-chip">${escapeHtml(s)}</span>`)
    .join("")}</div>`;
}

function buildBody(copy, lang) {
  const meta = (copy.meta || [])
    .map(
      (m) => `<div class="dr-meta__row">
      <p class="dr-meta__k">${escapeHtml(m.k)}</p>
      <p class="dr-meta__v">${escapeHtml(m.v)}</p>
    </div>`
    )
    .join("");

  const problems = (copy.problems || [])
    .map(
      (p) => `<article class="dr-card">
      <span class="dr-card__n">${escapeHtml(p.n)}</span>
      <h3 class="dr-card__t">${escapeHtml(p.t)}</h3>
      <p class="dr-card__d">${escapeHtml(p.d)}</p>
    </article>`
    )
    .join("");

  const caps = (copy.caps || [])
    .map((c, i) => {
      const ex = (c.examples || []).length
        ? `<div class="dr-card__chips">${(c.examples || [])
            .map((e) => `<span class="dr-chip">${escapeHtml(e)}</span>`)
            .join("")}</div>`
        : "";
      return `<article class="dr-card">
      <span class="dr-card__n">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="dr-card__t">${escapeHtml(c.t)}</h3>
      <p class="dr-card__d">${escapeHtml(c.d)}</p>
      ${ex}
    </article>`;
    })
    .join("");

  const useCases = (copy.useCases || [])
    .map(
      (u, i) => `<article class="dr-card">
      <span class="dr-card__n">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="dr-card__t">${escapeHtml(u.t)}</h3>
      <p class="dr-card__d">${escapeHtml(u.d)}</p>
    </article>`
    )
    .join("");

  const beforeItems = (copy.before || [])
    .map((t, i) => `<li class="dr-ba__item"><span class="dr-ba__n">${String(i + 1).padStart(2, "0")}</span><span class="dr-ba__t">${escapeHtml(t)}</span></li>`)
    .join("");
  const afterItems = (copy.after || [])
    .map((t, i) => `<li class="dr-ba__item"><span class="dr-ba__n">${String(i + 1).padStart(2, "0")}</span><span class="dr-ba__t">${escapeHtml(t)}</span></li>`)
    .join("");

  const flow = (copy.flow || [])
    .map(
      (f) => `<li class="dr-flow__item">
      <span class="dr-flow__n">${escapeHtml(f.n)}</span>
      <span class="dr-flow__t">${escapeHtml(f.t)}</span>
      <span class="dr-flow__d">${escapeHtml(f.d)}</span>
    </li>`
    )
    .join("");

  const process = (copy.process || [])
    .map(
      (p) => `<li class="bs-process__item">
      <span class="bs-process__n">${escapeHtml(p.n)}</span>
      <h3>${escapeHtml(p.t)}</h3>
      <p>${escapeHtml(p.d)}</p>
    </li>`
    )
    .join("");

  const scopes = (copy.scopes || [])
    .map(
      (s) => `<article class="dr-scope__col">
      <h3 class="dr-scope__t">${escapeHtml(s.t)}</h3>
      <ul class="dr-scope__list">${(s.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>
    </article>`
    )
    .join("");

  const timelines = (copy.timelines || [])
    .map(
      (t) => `<article class="dr-card">
      <h3 class="dr-card__t">${escapeHtml(t.t)}</h3>
      <p class="dr-card__d">${escapeHtml(t.d)}</p>
    </article>`
    )
    .join("");

  const priceFactors = `<ul class="dr-price__factors">${(copy.priceFactors || [])
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join("")}</ul>`;

  const faqs = (copy.faqs || [])
    .map(
      (f, i) => `<div class="bs-faq-item">
      <button type="button" class="bs-faq-q" aria-expanded="false" id="bs-faq-q-${i}" aria-controls="bs-faq-a-${i}">
        <span>${escapeHtml(f.q)}</span><span class="bs-faq-icon" aria-hidden="true"></span>
      </button>
      <div class="bs-faq-a" id="bs-faq-a-${i}" role="region" aria-labelledby="bs-faq-q-${i}"><div><p>${escapeHtml(f.a)}</p></div></div>
    </div>`
    )
    .join("");

  const overview = (copy.overviewBody || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");

  return `<nav class="bs-crumb" aria-label="Breadcrumb">
  <div class="bs-inner">
    <a href="../">${escapeHtml(copy.crumbBusiness || "BUSINESS")}</a>
    <span class="bs-crumb__sep" aria-hidden="true">/</span>
    <a href="../#services">${escapeHtml(copy.crumbServices || "SERVICES")}</a>
    <span class="bs-crumb__sep" aria-hidden="true">/</span>
    <span>${escapeHtml(copy.crumbHere || "INTERNAL TOOLS")}</span>
  </div>
</nav>

<section class="bs-hero" data-bs-reveal aria-labelledby="bs-hero-title">
  <div class="bs-inner bs-hero__grid">
    <div>
      <p class="bs-eyebrow">${escapeHtml(copy.eyebrow)}<span class="bs-eyebrow__sep" aria-hidden="true">·</span><span class="bs-eyebrow__sub">${escapeHtml(copy.subEyebrow)}</span></p>
      <h1 class="bs-hero__title" id="bs-hero-title">${br(copy.headline)}</h1>
      <p class="bs-hero__lead">${escapeHtml(copy.lead)}</p>
      <div class="bs-hero__actions">
        <a class="bs-btn bs-btn--primary" href="#inquiry" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaPrimary)}</a>
        <a class="bs-btn bs-btn--ghost" href="#capabilities">${escapeHtml(copy.ctaSecondary)}</a>
      </div>
    </div>
    <aside class="dr-meta" aria-label="Service summary">${meta}</aside>
  </div>
</section>
${serviceNav("internal-tools", lang)}

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.overviewLabel, copy.overviewTitle)}
    <div class="dr-prose">${overview}</div>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.problemsLabel, copy.problemsTitle)}
    <div class="dr-grid-2">${problems}</div>
  </div>
</section>

<section class="bs-section" data-bs-reveal id="capabilities">
  ${sectionHead(copy.capsLabel, copy.capsTitle)}
    <div class="dr-grid-2">${caps}</div>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.useLabel, copy.useTitle)}
    <p class="dr-badge">${escapeHtml(copy.useBadge)}</p>
    <div class="dr-grid-2">${useCases}</div>
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.baLabel, copy.baTitle)}
    <div class="dr-ba" aria-label="Before and after">
      <div class="dr-ba__col dr-ba__col--before">
        <p class="dr-ba__k">${escapeHtml(copy.beforeLabel)}</p>
        <ul class="dr-ba__list">${beforeItems}</ul>
      </div>
      <div class="dr-ba__arrow" aria-hidden="true"><span>→</span></div>
      <div class="dr-ba__col dr-ba__col--after">
        <p class="dr-ba__k">${escapeHtml(copy.afterLabel)}</p>
        <ul class="dr-ba__list">${afterItems}</ul>
      </div>
    </div>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal id="workflow">
  ${sectionHead(copy.flowLabel, copy.flowTitle)}
    <ol class="dr-flow">${flow}</ol>
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.featuresLabel, copy.featuresTitle, copy.featuresLead)}
    ${chips(copy.features)}
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.integLabel, copy.integTitle)}
    ${chips(copy.integrations)}
    <p class="dr-note">${escapeHtml(copy.integNote)}</p>
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.aiLabel, copy.aiTitle, copy.aiLead)}
    ${chips(copy.aiExamples)}
    <p class="dr-note">${escapeHtml(copy.aiNote)}</p>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.autoLabel, copy.autoTitle, copy.autoLead)}
    ${chips(copy.autoExamples)}
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.delLabel, copy.delTitle, copy.delLead)}
    ${chips(copy.deliverables)}
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal id="process">
  ${sectionHead(copy.processLabel, copy.processTitle)}
    <ol class="bs-process">${process}</ol>
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.scopeLabel, copy.scopeTitle, copy.scopeLead)}
    <div class="dr-scope">${scopes}</div>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.timeLabel, copy.timeTitle, copy.timeLead)}
    <div class="dr-grid-3">${timelines}</div>
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.priceLabel, copy.priceTitle)}
    <div class="dr-price">
      <div class="dr-price__panel">
        <p class="dr-price__name">${escapeHtml(copy.priceName)}</p>
        <p class="dr-price__value">${escapeHtml(copy.priceValue)}</p>
      </div>
      <div>
        <p class="bs-eyebrow">${escapeHtml(copy.priceFactorsLabel)}</p>
        ${priceFactors}
        <p class="dr-note">${escapeHtml(copy.priceNote)}</p>
      </div>
    </div>
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.extLabel, copy.extTitle)}
    ${chips(copy.extItems)}
  </div>
</section>

<section class="bs-section" data-bs-reveal>
  ${sectionHead(copy.secLabel, copy.secTitle, copy.secLead)}
    ${chips(copy.secItems)}
  </div>
</section>

<section class="bs-section bs-section--surface" data-bs-reveal>
  ${sectionHead(copy.faqLabel, copy.faqTitle)}
    <div class="bs-faq">${faqs}</div>
  </div>
</section>

<section class="bs-section bs-section--dark bs-final" data-bs-reveal>
  <div class="bs-inner">
    <p class="bs-eyebrow">${escapeHtml(copy.finalLabel)}</p>
    <h2 class="bs-final__title">${br(copy.finalTitle)}</h2>
    <p class="bs-lead">${escapeHtml(copy.finalLead)}</p>
    <a class="bs-btn bs-btn--primary" href="#inquiry" data-analytics="business_service_cta_click">${escapeHtml(copy.ctaPrimary)}</a>
    <div class="dr-links">
      <a class="bs-related__all" href="../automation/">${escapeHtml(copy.backAutomation)}</a>
      <a class="bs-related__all" href="../ai-automation/">${escapeHtml(copy.exploreAi)}</a>
    </div>
  </div>
</section>

<section class="bs-section" id="inquiry" data-bs-reveal aria-labelledby="dr-form-title">
  <div class="bs-inner dr-form-wrap">
    <p class="bs-eyebrow">INQUIRY</p>
    <h2 class="bs-title" id="dr-form-title">${escapeHtml(copy.formTitle)}</h2>
    <p class="bs-lead">${escapeHtml(copy.formLead)}</p>
    <form
      class="dr-form"
      id="bz-inquiry-form"
      novalidate
      data-submit="${escapeHtml(copy.submit)}"
      data-submitting="${escapeHtml(copy.submitting)}"
      data-subject="${escapeHtml(copy.mailSubject)}"
    >
      <div class="dr-field">
        <label>${escapeHtml(copy.labelCategory)}</label>
        <div class="dr-readonly"><strong>${escapeHtml(copy.formCategory)}</strong></div>
        <input type="hidden" name="service_category" value="${escapeHtml(copy.formCategory)}" />
      </div>
      <div class="dr-field">
        <label>${escapeHtml(copy.labelService)}</label>
        <div class="dr-readonly"><strong>${escapeHtml(copy.formService)}</strong></div>
        <input type="hidden" name="type" value="AUTOMATION / INTERNAL TOOLS" data-label="${escapeHtml(copy.formService)}" />
      </div>
      <div class="dr-field">
        <label for="bz-name">${escapeHtml(copy.labelName)}<span class="dr-req">*</span></label>
        <input id="bz-name" name="name" type="text" required autocomplete="name" />
      </div>
      <div class="dr-field">
        <label for="bz-company">${escapeHtml(copy.labelCompany)}<span class="dr-req">*</span></label>
        <input id="bz-company" name="company" type="text" required autocomplete="organization" />
      </div>
      <div class="dr-field">
        <label for="bz-email">${escapeHtml(copy.labelEmail)}<span class="dr-req">*</span></label>
        <input id="bz-email" name="email" type="email" required autocomplete="email" inputmode="email" />
      </div>
      <div class="dr-field">
        <label>${escapeHtml(copy.labelCurrentTools)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        ${checkGrid("tools", copy.currentToolsOptions)}
      </div>
      <div class="dr-field">
        <label for="it-current-work">${escapeHtml(copy.labelCurrentWork)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        <input id="it-current-work" name="current_work" type="text" placeholder="${escapeHtml(copy.phCurrentWork)}" />
      </div>
      <div class="dr-field">
        <label>${escapeHtml(copy.labelDesired)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        ${checkGrid("features", copy.desiredOptions)}
      </div>
      <div class="dr-field">
        <label for="it-users">${escapeHtml(copy.labelUsers)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        <select id="it-users" name="expected_users">${optionsHtml(copy.usersOptions, "")}</select>
      </div>
      <div class="dr-field">
        <label for="it-integrations">${escapeHtml(copy.labelIntegrations)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        <input id="it-integrations" name="integrations" type="text" placeholder="${escapeHtml(copy.phIntegrations)}" />
      </div>
      <div class="dr-field">
        <label for="bz-timeline">${escapeHtml(copy.labelTimeline)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        <select id="bz-timeline" name="timeline">${optionsHtml(copy.timelineOptions, "")}</select>
      </div>
      <div class="dr-field">
        <label for="bz-budget">${escapeHtml(copy.labelBudget)} <span class="dr-opt">(${escapeHtml(copy.optional)})</span></label>
        <select id="bz-budget" name="budget">${optionsHtml(copy.budgetOptions, "")}</select>
      </div>
      <div class="dr-field">
        <label for="bz-message">${escapeHtml(copy.labelMessage)}<span class="dr-req">*</span></label>
        <textarea id="bz-message" name="message" required placeholder="${escapeHtml(copy.phMessage)}"></textarea>
      </div>
      <div class="dr-field">
        <div class="dr-consent">
          <label class="dr-consent__label" for="bz-consent">
            <input id="bz-consent" name="consent" type="checkbox" value="yes" required />
            <span>${escapeHtml(copy.labelConsent)}</span>
          </label>
          <a class="dr-consent__link" href="../../privacy/" target="_blank" rel="noopener noreferrer">${escapeHtml(copy.privacyLink)} ↗</a>
        </div>
      </div>
      <div class="dr-hp" aria-hidden="true"><input name="_honey" tabindex="-1" autocomplete="off" /></div>
      <button class="dr-submit" type="submit" id="bz-submit">
        <span class="bz-submit-spin" aria-hidden="true"></span>
        <span class="bz-submit-label">${escapeHtml(copy.submit)}</span>
      </button>
    </form>
    <p class="dr-fail" id="bz-fail" role="alert" hidden>${escapeHtml(copy.fail)}</p>
  </div>
</section>`;
}

export function renderInternalTools() {
  const flatEn = flatten(loadJson("en.json"));

  for (const { dir, file, htmlLang } of LANGS) {
    const lang = dir;
    const copy = getInternalToolsCopy(lang);
    const flat = flatten(loadJson(file));
    let html = template;
    html = html.replace(/\{\{HTML_LANG\}\}/g, htmlLang);
    html = html.replace(/\{\{FONT_LINKS\}\}/g, fontLinksHtml(dir));
    html = html.replace(/\{\{OG_LOCALE\}\}/g, OG_LOCALE[dir] || "en_US");
    html = html.replace(
      /\{\{CANONICAL\}\}/g,
      `${SITE_ORIGIN}/${dir}/business/internal-tools/`
    );
    html = html.replace(/\{\{HREFLANG_BLOCK\}\}/g, hreflangBlock());
    html = html.replace(/\{\{SEO_TITLE\}\}/g, escapeHtml(copy.seoTitle || ""));
    html = html.replace(/\{\{META_DESCRIPTION\}\}/g, escapeHtml(copy.metaDescription || ""));
    html = html.replace(/\{\{PAGE_BODY\}\}/g, buildBody(copy, lang));
    html = html.replace(
      'data-bs-service="data-reporting"',
      'data-bs-service="internal-tools"'
    );
    html = html.replace(
      'data-bs-analytics="data_reporting"',
      'data-bs-analytics="internal_tools"'
    );
    html = injectSiteChrome(html, flat, flatEn, { activeNav: "business", base: "../../" });

    const outDir = path.join(ROOT, dir, "business", "internal-tools");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "index.html"), html);

    // Legacy AUTOMATION path → canonical SERVICES path
    const legacyDir = path.join(ROOT, dir, "business", "automation", "internal-tools");
    fs.mkdirSync(legacyDir, { recursive: true });
    const target = `/${dir}/business/internal-tools/`;
    fs.writeFileSync(
      path.join(legacyDir, "index.html"),
      `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=${target}"/><link rel="canonical" href="${SITE_ORIGIN}${target}"/><title>Redirect</title></head><body><p><a href="${target}">Continue</a></p></body></html>\n`
    );
  }

  // root redirect
  const rootOut = path.join(ROOT, "business", "internal-tools", "index.html");
  fs.mkdirSync(path.dirname(rootOut), { recursive: true });
  fs.writeFileSync(
    rootOut,
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta http-equiv="refresh" content="0;url=/en/business/internal-tools/"/><link rel="canonical" href="${SITE_ORIGIN}/en/business/internal-tools/"/><title>Redirect</title></head><body><p><a href="/en/business/internal-tools/">Continue</a></p></body></html>\n`
  );

  const pub = path.join(ROOT, "_publish");
  if (fs.existsSync(pub)) {
    for (const { dir } of LANGS) {
      const src = path.join(ROOT, dir, "business", "internal-tools", "index.html");
      const destDir = path.join(pub, dir, "business", "internal-tools");
      if (fs.existsSync(src)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(src, path.join(destDir, "index.html"));
      }
      const legacySrc = path.join(ROOT, dir, "business", "automation", "internal-tools", "index.html");
      const legacyDest = path.join(pub, dir, "business", "automation", "internal-tools");
      if (fs.existsSync(legacySrc)) {
        fs.mkdirSync(legacyDest, { recursive: true });
        fs.copyFileSync(legacySrc, path.join(legacyDest, "index.html"));
      }
    }
    const rootSrc = path.join(ROOT, "business", "internal-tools", "index.html");
    const rootDest = path.join(pub, "business", "internal-tools");
    fs.mkdirSync(rootDest, { recursive: true });
    fs.copyFileSync(rootSrc, path.join(rootDest, "index.html"));
  }

  console.log(`render-internal-tools: wrote ${LANGS.length} language pages (+ SERVICES nav)`);
}

const isMain =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  renderInternalTools();
}
