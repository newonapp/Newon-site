/**
 * NEWON unified Contact page body — /{lang}/contact/.
 * Six sections (brief order): Hero · Contact Categories · Contact Form · Contact Information · FAQ · Final CTA.
 * Design language = the home page (home-portfolio.css np-* type, pills, cards; the home first-screen film hero).
 * Only the hero background film comes from the separate owner spec.
 */
import { escapeHtml } from "./hub-utils.mjs";
import {
  CONTACT_INBOX,
  CONTACT_HERO_FILM,
  CONTACT_PURPOSE_IDS,
  CONTACT_MESSAGE_MAX,
  CONTACT_MESSAGE_MIN,
} from "./contact-page-copy.mjs";
import {
  CONTACT_PLATFORM_IDS,
  CONTACT_PLATFORM_ALIASES,
  CONTACT_INQUIRERS,
  CONTACT_INQUIRY_TYPES,
  CONTACT_TYPE_PRESETS,
  CONTACT_TOPICS,
  CONTACT_TOPIC_STATUS,
  CONTACT_CONDITIONAL_FIELDS,
  CONTACT_PROPOSAL_INQUIRIES,
} from "./contact-taxonomy.mjs";

const e = (s) => escapeHtml(String(s ?? ""));
const br = (s) => e(s).replace(/\n/g, "<br />");
const pad = (n) => String(n).padStart(2, "0");

function heroSection(c) {
  const topics = c.heroTopics.map((t) => `<li>${e(t)}</li>`).join("");
  return `<section id="contact-top" class="hero--film ct-hero" aria-label="${e(c.heroAria)}">
  <div class="nhv-stage" aria-hidden="true">
    <div class="nhv-fallback"></div>
    <video
      class="nhv-video"
      src="${e(CONTACT_HERO_FILM.video)}"
      poster="${e(CONTACT_HERO_FILM.poster)}"
      autoplay
      muted
      loop
      playsinline
      webkit-playsinline
      preload="auto"
      disablepictureinpicture
      controlslist="nodownload nofullscreen noremoteplayback"
      tabindex="-1"
      aria-hidden="true"
    >
      <source src="${e(CONTACT_HERO_FILM.video)}" type="video/mp4" />
    </video>
    <div class="ct-hero__shade"></div>
    <div class="ct-hero__veil"></div>
  </div>
  <div class="ct-hero__lockup">
    <p class="ct-hero__word">${e(c.heroWord)}</p>
    <h1 class="ct-hero__title">${br(c.heroTitle)}</h1>
    <span class="ct-hero__rule" aria-hidden="true"></span>
    <p class="ct-hero__lead">${c.heroLead.split("\n").map((l) => `<span class="ct-hero__line">${e(l)}</span>`).join(" ")}</p>
    <ul class="ct-hero__topics">${topics}</ul>
    <div class="ct-hero__actions">
      <a class="np-pill np-pill--solid" href="#contact-form" data-ct-scroll>${e(c.heroCtaForm)}</a>
      <a class="np-pill" href="#contact-categories" data-ct-scroll>${e(c.heroCtaTypes)}</a>
    </div>
  </div>
</section>`;
}

function categoriesSection(c) {
  const cards = c.categories
    .map((cat, i) => {
      const items = cat.items.map((t) => `<li>${e(t)}</li>`).join("");
      return `<li class="ct-cat np-reveal" data-ct-cat="${e(cat.id)}">
        <div class="ct-cat__top"><span class="np-num">${pad(i + 1)}</span><span class="np-en">${e(cat.en)}</span></div>
        <h3 class="ct-cat__title" id="ct-cat-${e(cat.id)}">${e(cat.title)}</h3>
        <p class="ct-cat__body">${e(cat.body)}</p>
        <ul class="ct-cat__items">${items}</ul>
        <a class="ct-cat__pick" href="?type=${e(cat.id)}#contact-form" data-ct-pick="${e(cat.id)}" aria-describedby="ct-cat-${e(cat.id)}">${e(c.catPick)}<span class="ct-sr"> · ${e(cat.title)}</span> <span aria-hidden="true">→</span></a>
      </li>`;
    })
    .join("");
  return `<section id="contact-categories" class="ct-sec ct-sec--light ct-sec--lift ct-cats" aria-labelledby="ct-cat-title">
  <div class="ct-wrap">
    <header class="ct-head ct-head--center">
      <p class="np-kicker">${e(c.catKicker)}</p>
      <h2 id="ct-cat-title" class="np-display ct-h2" tabindex="-1">${e(c.catTitle)}</h2>
      <p class="np-lead">${e(c.catLead)}</p>
    </header>
    <ol class="ct-cat-grid">${cards}</ol>
  </div>
</section>`;
}

function opt(value, label, extra = "") {
  return `<option value="${e(value)}"${extra}>${e(label)}</option>`;
}

function label(forId, text, c, required) {
  const tag = required
    ? `<span class="ct-req" aria-hidden="true">*</span>`
    : `<span class="ct-opt">${e(c.optional)}</span>`;
  return `<label class="ct-label" for="${forId}">${e(text)} ${tag}</label>`;
}

function field({ id, name, text, c, required = false, type = "text", attrs = "", hint = "", control = "" }) {
  const hintId = hint ? `${id}-hint` : "";
  const describedby = hintId ? ` aria-describedby="${hintId}" data-ct-desc="${hintId}"` : ` data-ct-desc=""`;
  const req = required ? " required" : "";
  const input =
    control ||
    `<input class="ct-input" id="${id}" name="${name}" type="${type}"${req}${describedby} ${attrs} />`;
  return `<div class="ct-field" data-ct-field="${name}">
          ${label(id, text, c, required)}
          ${input}
          ${hint ? `<p class="ct-hint" id="${hintId}">${e(hint)}</p>` : ""}
          <p class="ct-err" id="${id}-err" hidden></p>
        </div>`;
}

/** ko labels for ko, en labels for every other locale (same fallback as the page copy). */
const L = (item, c) => (c._lang === "ko" ? item.ko : item.en);
function topicText(t, c) {
  const st = t.status && CONTACT_TOPIC_STATUS[t.status] ? CONTACT_TOPIC_STATUS[t.status][c._lang === "ko" ? "ko" : "en"] : "";
  return st ? `${L(t, c)} · ${st}` : L(t, c);
}

/** A conditional field wrapper: hidden until contact-page.js shows it (CONTACT_CONDITIONAL_FIELDS). */
function when(name, html) {
  return `<div class="ct-cond" data-ct-when="${name}" hidden>
          ${html}
        </div>`;
}

function formSection(c, lang) {
  const typeOptions = [opt("", c.typePlaceholder), ...CONTACT_INQUIRY_TYPES.map((t) => opt(t.id, L(t, c)))].join("");
  const purposeOptions = [opt("", c.purposePlaceholder), ...CONTACT_PURPOSE_IDS.map((id) => opt(id, c.purposes[id]))].join("");
  const platformOptions = [opt("", c.platformPlaceholder), ...CONTACT_PLATFORM_IDS.map((id) => opt(id, c.platforms[id]))].join("");
  const topicOptions = [
    opt("", c.topicPlaceholder),
    ...Object.entries(CONTACT_TOPICS).map(
      ([pid, list]) => `<optgroup label="${e(c.platforms[pid])}" data-ct-platform="${e(pid)}">${list.map((t) => opt(t.id, topicText(t, c))).join("")}</optgroup>`
    ),
  ].join("");
  const inquirerRadios = CONTACT_INQUIRERS.map(
    (x) => `<label class="ct-seg__opt"><input type="radio" name="inquirer" value="${e(x.id)}" required /><span>${e(L(x, c))}</span></label>`
  ).join("\n            ");
  const steps = c.formSteps
    .map(([n, t, d]) => `<li><span class="ct-steps__n">${e(n)}</span><div><strong>${e(t)}</strong><p>${e(d)}</p></div></li>`)
    .join("");
  const consentRows = c.consentRows.map(([k, v]) => `<div><dt>${e(k)}</dt><dd>${e(v)}</dd></div>`).join("");

  const config = {
    endpoint: `https://formsubmit.co/ajax/${CONTACT_INBOX}`,
    inbox: CONTACT_INBOX,
    lang,
    messageMin: CONTACT_MESSAGE_MIN,
    messageMax: CONTACT_MESSAGE_MAX,
    presets: CONTACT_TYPE_PRESETS,
    platforms: CONTACT_PLATFORM_IDS,
    platformAliases: CONTACT_PLATFORM_ALIASES,
    platformLabels: Object.fromEntries(CONTACT_PLATFORM_IDS.map((id) => [id, c.platforms[id]])),
    inquirers: CONTACT_INQUIRERS.map((x) => ({ id: x.id, label: L(x, c) })),
    inquiries: CONTACT_INQUIRY_TYPES.map((x) => ({ id: x.id, label: L(x, c) })),
    categories: c.categories.map((cat) => ({ id: cat.id, label: cat.title })),
    topics: Object.fromEntries(
      Object.entries(CONTACT_TOPICS).map(([pid, list]) => [pid, list.map((t) => ({ id: t.id, label: topicText(t, c), status: t.status, inquiry: t.inquiry, ref: t.ref }))])
    ),
    rules: CONTACT_CONDITIONAL_FIELDS,
    proposal: CONTACT_PROPOSAL_INQUIRIES,
    orgLabels: c.orgLabels,
    t: {
      submit: c.submit,
      submitting: c.submitting,
      tooFast: c.tooFast,
      errSummary: c.errSummary,
      errRequired: c.errRequired,
      errType: c.errType,
      errInquirer: c.errInquirer,
      errEmail: c.errEmail,
      errUrl: c.errUrl,
      errPhone: c.errPhone,
      errMessageMin: c.errMessageMin,
      errMessageMax: c.errMessageMax,
      errConsent: c.errConsent,
      failBody: c.failBody,
      failServerBody: c.failServerBody,
      failNetBody: c.failNetBody,
      duplicate: c.duplicate,
      successMetaLabel: c.successMetaLabel,
      orgLabel: c.orgLabel,
      errorDetailLabel: c.errorDetailLabel,
      messageLabel: c.messageLabel,
      messageLabelProposal: c.messageLabelProposal,
      copied: c.copied,
      copyFail: c.copyFail,
      mailSubject: c.mailSubject,
      counterSuffix: c.counterSuffix,
    },
  };

  const select = (id, name, options, required, extraAttrs = "") =>
    `<select class="ct-input ct-select" id="${id}" name="${name}"${required ? " required" : ""} data-ct-desc=""${extraAttrs}>${options}</select>`;
  const textarea = (id, name, rows, maxlength, placeholder) =>
    `<textarea class="ct-input ct-textarea ct-textarea--short" id="${id}" name="${name}" rows="${rows}" maxlength="${maxlength}" data-ct-desc="" placeholder="${e(placeholder)}"></textarea>`;

  return `<section id="contact-form" class="ct-sec ct-sec--dark ct-sec--lift ct-formsec" aria-labelledby="ct-form-title">
  <div class="ct-wrap ct-formsec__grid">
    <header class="ct-formsec__intro">
      <p class="np-kicker">${e(c.formKicker)}</p>
      <h2 id="ct-form-title" class="np-display ct-h2 ct-h2--left" tabindex="-1">${e(c.formTitle)}</h2>
      <p class="np-lead ct-lead--left">${e(c.formLead)}</p>
      <ol class="ct-steps">${steps}</ol>
      <p class="ct-formsec__mail"><span class="np-en">${e(c.infoEmailLabel)}</span> <a href="mailto:${CONTACT_INBOX}">${CONTACT_INBOX}</a></p>
    </header>
    <div class="ct-formcard">
      <form id="ct-form" class="ct-form" novalidate data-ct-form aria-labelledby="ct-form-title" aria-describedby="ct-req-note">
        <p class="ct-note" id="ct-req-note">${e(c.formRequiredNote)}</p>
        <div class="ct-alert" id="ct-form-alert" role="alert" tabindex="-1" hidden></div>

        <fieldset class="ct-field ct-persona" id="ct-inquirer" data-ct-field="inquirer" data-ct-desc="">
          <legend class="ct-label">${e(c.personaLegend)} <span class="ct-req" aria-hidden="true">*</span></legend>
          <div class="ct-seg ct-seg--6">
            ${inquirerRadios}
          </div>
          <p class="ct-err" id="ct-inquirer-err" hidden></p>
        </fieldset>

        ${field({ id: "ct-type", name: "inquiry_type", text: c.typeLabel, c, required: true, control: select("ct-type", "inquiry_type", typeOptions, true) })}

        <div class="ct-org" data-ct-org hidden>
          ${when("organization", field({ id: "ct-org-name", name: "organization", text: c.orgLabel, c, attrs: `autocomplete="organization" maxlength="160" placeholder="${e(c.orgPlaceholder)}"` }))}
          <div class="ct-row">
            ${when("position", field({ id: "ct-position", name: "position", text: c.positionLabel, c, attrs: `autocomplete="organization-title" maxlength="80" placeholder="${e(c.positionPlaceholder)}"` }))}
            ${when("website", field({ id: "ct-website", name: "website", text: c.websiteLabel, c, type: "url", attrs: `inputmode="url" autocomplete="url" maxlength="300" placeholder="https://"` }))}
          </div>
          ${when("business_purpose", field({ id: "ct-purpose", name: "business_purpose", text: c.purposeLabel, c, control: select("ct-purpose", "business_purpose", purposeOptions, false) }))}
          ${when("partnership_goal", field({ id: "ct-goal", name: "partnership_goal", text: c.partnershipGoalLabel, c, attrs: `maxlength="200" placeholder="${e(c.partnershipGoalPlaceholder)}"` }))}
          ${when("investor_info", field({ id: "ct-investor", name: "investor_info", text: c.investorInfoLabel, c, hint: c.investorInfoHint, attrs: `maxlength="300" placeholder="${e(c.investorInfoPlaceholder)}"` }))}
        </div>

        <div class="ct-row">
          ${field({ id: "ct-name", name: "name", text: c.nameLabel, c, required: true, attrs: `autocomplete="name" maxlength="80"` })}
          ${field({ id: "ct-email", name: "email", text: c.emailLabel, c, required: true, type: "email", attrs: `autocomplete="email" inputmode="email" maxlength="160" placeholder="${e(c.emailPlaceholder)}"` })}
        </div>
        <div class="ct-row">
          ${field({ id: "ct-phone", name: "phone", text: c.phoneLabel, c, type: "tel", attrs: `autocomplete="tel" inputmode="tel" maxlength="20" placeholder="${e(c.phonePlaceholder)}"` })}
          ${field({ id: "ct-platform", name: "platform", text: c.platformLabel, c, control: select("ct-platform", "platform", platformOptions, false) })}
        </div>

        ${when("topic", field({ id: "ct-topic", name: "topic", text: c.topicLabel, c, hint: c.topicHint, control: select("ct-topic", "topic", topicOptions, false).replace('data-ct-desc=""', 'aria-describedby="ct-topic-hint" data-ct-desc="ct-topic-hint"') }))}

        <div class="ct-org ct-org--detail" data-ct-detail hidden>
          ${when("environment", field({ id: "ct-env", name: "environment", text: c.environmentLabel, c, attrs: `maxlength="200" placeholder="${e(c.environmentPlaceholder)}"` }))}
          ${when("error_detail", field({ id: "ct-error", name: "error_detail", text: c.errorDetailLabel, c, control: textarea("ct-error", "error_detail", 4, 1500, c.errorDetailPlaceholder) }))}
          ${when("reference_id", field({ id: "ct-refid", name: "reference_id", text: c.referenceIdLabel, c, hint: c.referenceIdHint, attrs: `maxlength="80" autocomplete="off"` }))}
        </div>

        ${field({ id: "ct-subject", name: "subject", text: c.subjectLabel, c, required: true, attrs: `maxlength="150" placeholder="${e(c.subjectPlaceholder)}"` })}

        <div class="ct-field ct-field--message" data-ct-field="message">
          <label class="ct-label" for="ct-message"><span data-ct-message-label>${e(c.messageLabel)}</span> <span class="ct-req" aria-hidden="true">*</span></label>
          <textarea class="ct-input ct-textarea" id="ct-message" name="message" rows="9" required maxlength="${CONTACT_MESSAGE_MAX}" minlength="${CONTACT_MESSAGE_MIN}" aria-describedby="ct-message-hint ct-message-count" data-ct-desc="ct-message-hint ct-message-count" placeholder="${e(c.messagePlaceholder)}"></textarea>
          <div class="ct-meta">
            <p class="ct-hint" id="ct-message-hint">${e(c.messageHint)}</p>
            <p class="ct-count" id="ct-message-count" data-ct-count><span data-ct-count-n>0</span> / ${CONTACT_MESSAGE_MAX.toLocaleString("en-US")}${c.counterSuffix ? e(c.counterSuffix) : ""}</p>
          </div>
          <p class="ct-err" id="ct-message-err" hidden></p>
        </div>

        ${field({ id: "ct-reference", name: "reference_url", text: c.referenceLabel, c, type: "url", hint: c.referenceHint, attrs: `inputmode="url" maxlength="500" placeholder="https://"` })}

        <div class="ct-consent" data-ct-field="consent">
          <h3 class="ct-consent__title">${e(c.consentTitle)}</h3>
          <dl class="ct-consent__rows" id="ct-consent-notice">${consentRows}</dl>
          <p class="ct-consent__link"><a href="/${e(lang)}/privacy/">${e(c.privacyLink)} <span aria-hidden="true">↗</span></a></p>
          <label class="ct-check" for="ct-consent">
            <input type="checkbox" id="ct-consent" name="privacy_consent" value="yes" required aria-describedby="ct-consent-notice" data-ct-desc="ct-consent-notice" />
            <span>${e(c.consentLabel)}</span>
          </label>
          <p class="ct-err" id="ct-consent-err" hidden></p>
        </div>

        <div class="ct-hp" aria-hidden="true">
          <label for="ct-hp-field">Leave this field empty</label>
          <input type="text" id="ct-hp-field" name="_honey" tabindex="-1" autocomplete="off" />
        </div>

        <div class="ct-submit">
          <button type="submit" class="ct-btn" data-ct-submit><span class="ct-btn__spin" aria-hidden="true"></span><span data-ct-submit-label>${e(c.submit)}</span></button>
          <p class="ct-status ct-sr" role="status" aria-live="polite" data-ct-status></p>
        </div>
      </form>

      <div class="ct-result ct-result--ok" data-ct-success role="status" tabindex="-1" hidden>
        <span class="ct-result__mark" aria-hidden="true">✓</span>
        <h3 class="ct-result__title">${e(c.successTitle)}</h3>
        <p class="ct-result__body">${e(c.successBody)}</p>
        <p class="ct-result__body ct-result__meta" data-ct-success-meta hidden></p>
        <button type="button" class="ct-btn ct-btn--ghost" data-ct-again>${e(c.successAgain)}</button>
      </div>

      <div class="ct-result ct-result--fail" data-ct-fail role="alert" tabindex="-1" hidden>
        <h3 class="ct-result__title">${e(c.failTitle)}</h3>
        <p class="ct-result__body" data-ct-fail-body>${e(c.failBody)}</p>
        <div class="ct-result__actions">
          <button type="button" class="ct-btn" data-ct-retry>${e(c.failRetry)}</button>
          <a class="ct-btn ct-btn--ghost" data-ct-mailto href="mailto:${CONTACT_INBOX}">${e(c.failMail)} · ${CONTACT_INBOX}</a>
        </div>
      </div>
    </div>
  </div>
  <script type="application/json" id="ct-config">${JSON.stringify(config).replace(/</g, "\\u003c")}</script>
</section>`;
}

function infoSection(c) {
  return `<section id="contact-info" class="ct-sec ct-sec--light ct-sec--lift ct-info" aria-labelledby="ct-info-title">
  <div class="ct-wrap">
    <header class="ct-head ct-head--center">
      <p class="np-kicker">${e(c.infoKicker)}</p>
      <h2 id="ct-info-title" class="np-display ct-h2">${e(c.infoTitle)}</h2>
      <p class="np-lead">${e(c.infoLead)}</p>
    </header>
    <ul class="ct-info__list">
      <li class="ct-info__row np-reveal">
        <span class="ct-info__n" aria-hidden="true">01</span>
        <div class="ct-info__body">
          <p class="np-en">${e(c.infoCompanyLabel)}</p>
          <h3 class="ct-info__name">${e(c.infoCompanyName)}</h3>
          <p class="ct-info__value">${e(c.infoCompany)}</p>
        </div>
      </li>
      <li class="ct-info__row np-reveal">
        <span class="ct-info__n" aria-hidden="true">02</span>
        <div class="ct-info__body">
          <p class="np-en">${e(c.infoEmailLabel)}</p>
          <h3 class="ct-info__name">${e(c.infoEmailName)}</h3>
          <p class="ct-info__value"><a href="mailto:${CONTACT_INBOX}">${CONTACT_INBOX}</a></p>
        </div>
        <div class="ct-info__actions">
          <button type="button" class="np-pill ct-pill-dark" data-ct-copy="${CONTACT_INBOX}">${e(c.copyEmail)}</button>
          <a class="np-pill np-pill--solid ct-pill-dark" href="mailto:${CONTACT_INBOX}">${e(c.mailOpen)} <span aria-hidden="true">↗</span></a>
          <p class="ct-copy-status" role="status" aria-live="polite" data-ct-copy-status></p>
        </div>
      </li>
      <li class="ct-info__row np-reveal">
        <span class="ct-info__n" aria-hidden="true">03</span>
        <div class="ct-info__body">
          <p class="np-en">${e(c.infoWebLabel)}</p>
          <h3 class="ct-info__name">${e(c.infoWebName)}</h3>
          <p class="ct-info__value"><a href="https://www.newon.app/">www.newon.app</a></p>
        </div>
      </li>
    </ul>
  </div>
</section>`;
}

function faqSection(c) {
  const items = c.faq
    .map(
      ([q, a], i) => `<div class="ct-faq__item">
        <h3 class="ct-faq__q">
          <button type="button" class="ct-faq__btn" id="ct-faq-q${i + 1}" aria-expanded="false" aria-controls="ct-faq-a${i + 1}">
            <span class="ct-faq__n" aria-hidden="true">Q${i + 1}</span>
            <span class="ct-faq__qt">${e(q)}</span>
            <span class="ct-faq__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="ct-faq__a" id="ct-faq-a${i + 1}" role="region" aria-labelledby="ct-faq-q${i + 1}" hidden>
          <p><span class="ct-faq__an" aria-hidden="true">A.</span> ${e(a)}</p>
        </div>
      </div>`
    )
    .join("");
  return `<section id="contact-faq" class="ct-sec ct-sec--light ct-faq" aria-labelledby="ct-faq-title">
  <div class="ct-wrap ct-faq__grid">
    <header class="ct-faq__head">
      <p class="np-kicker">${e(c.faqKicker)}</p>
      <h2 id="ct-faq-title" class="np-display ct-h2 ct-h2--left">${e(c.faqTitle)}</h2>
      <p class="np-lead ct-lead--left">${e(c.faqLead)}</p>
    </header>
    <div class="ct-faq__list">${items}</div>
  </div>
  <noscript><style>.ct-faq__a[hidden]{display:block!important}</style></noscript>
</section>`;
}

function ctaSection(c) {
  const leads = c.ctaLead.map((l) => `<p class="np-lead">${e(l)}</p>`).join("");
  return `<section id="contact-cta" class="ct-sec ct-sec--dark ct-sec--lift ct-cta" aria-labelledby="ct-cta-title">
  <div class="ct-wrap ct-head--center">
    <p class="np-kicker">${e(c.ctaKicker)}</p>
    <h2 id="ct-cta-title" class="np-display ct-cta__title">${br(c.ctaTitle)}</h2>
    ${leads}
    <div class="np-actions">
      <a class="np-pill np-pill--solid" href="#contact-form" data-ct-scroll>${e(c.ctaButton)}</a>
    </div>
  </div>
</section>`;
}

export function contactPageBody(c, lang) {
  const langAttr = c._fallback ? ` lang="en"` : "";
  return `<div class="np-home ct-page" data-ct-page${langAttr}>
${heroSection(c)}
${categoriesSection(c)}
${formSection(c, lang)}
${infoSection(c)}
${faqSection(c)}
${ctaSection(c)}
</div>`;
}

export function contactPageStructuredData(c, lang, url, htmlLang) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: c.seoTitle,
    url,
    inLanguage: c._fallback ? "en" : htmlLang,
    description: c.metaDescription,
    isPartOf: { "@type": "WebSite", name: "NEWON", url: "https://www.newon.app/" },
    mainEntity: {
      "@type": "Organization",
      name: "NEWON",
      alternateName: "뉴온",
      url: "https://www.newon.app/",
      email: CONTACT_INBOX,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTACT_INBOX,
        url,
      },
    },
  };
}
