/**
 * Life Stage homepage section HTML. Scoped to #story-lifestage.
 */
import { escapeHtml } from "./hub-utils.mjs";
import { APP_CATALOG } from "./portfolio-data.mjs";
import { getLifeStageCopy } from "./home-lifestage-copy.mjs";

const APP_BY_SLUG = Object.fromEntries(APP_CATALOG.map((a) => [a.slug, a]));

function nl(s) {
  return escapeHtml(s || "").replace(/\n/g, "<br>");
}

function titleBlock(kicker, title, lead) {
  return `<header class="nls-head">
    ${kicker ? `<p class="nls-kicker">${escapeHtml(kicker)}</p>` : ""}
    <h3 class="nls-title">${nl(title)}</h3>
    ${lead ? `<p class="nls-lead">${escapeHtml(lead)}</p>` : ""}
  </header>`;
}

function badge(label, kind = "planned") {
  return `<span class="nls-badge nls-badge--${escapeHtml(kind)}">${escapeHtml(label)}</span>`;
}

function list(items, cls = "nls-list") {
  return `<ul class="${cls}">${items.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function tabBtn(group, key, label, selected, extraClass = "") {
  return `<button type="button" class="nls-tab${extraClass}${selected ? " is-active" : ""}" data-nls-tab data-nls-group="${escapeHtml(group)}" data-nls-key="${escapeHtml(key)}" role="tab" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}">${label}</button>`;
}

function heroTimeline(c) {
  const nodes = c.ages.items
    .map((a, i) => {
      const on = i === 0;
      return `<button type="button" class="nls-node${on ? " is-active" : ""}" data-nls-tab data-nls-group="age" data-nls-key="${escapeHtml(a.id)}" aria-pressed="${on ? "true" : "false"}">
        <span class="nls-node__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="nls-node__age">${escapeHtml(a.age)}</span>
        <span class="nls-node__name">${escapeHtml(a.name)}</span>
      </button>`;
    })
    .join("");
  const first = c.ages.items[0] || { age: "", name: "", intro: "" };
  return `<div class="nls-visual" aria-label="${escapeHtml(c.hero.theme)}">
    <div class="nls-sv">
      <div class="nls-sv__head">
        <span class="nls-sv__live"><i></i> LIFE TIMELINE</span>
        <span class="nls-sv__meta">DIRECTION</span>
      </div>
      <div class="nls-sv__rail">${nodes}</div>
      <div class="nls-sv__grid">
        <article class="is-on">
          <p class="nls-sv__k">NOW</p>
          <strong>${escapeHtml(first.name)}</strong>
          <em>${escapeHtml(first.age)}</em>
        </article>
        <article>
          <p class="nls-sv__k">LEARN</p>
          <strong>Knowledge</strong>
          <em>Life Knowledge</em>
        </article>
        <article>
          <p class="nls-sv__k">CONNECT</p>
          <strong>Guide → Plan → Do</strong>
          <em>Info to service</em>
        </article>
      </div>
    </div>
  </div>`;
}

function agesBlock(c) {
  const tabs = c.ages.items
    .map((a, i) => tabBtn("age", a.id, `<span>${escapeHtml(a.age)}</span><em>${escapeHtml(a.name)}</em>`, i === 0))
    .join("");
  const panels = c.ages.items
    .map((a, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const groups = (a.groups || [{ title: "", topics: a.topics || [] }])
        .map(
          (g) => `<div class="nls-age-group">
            ${g.title ? `<p class="nls-mini">${escapeHtml(g.title)}</p>` : ""}
            ${list(g.topics, "nls-chips")}
          </div>`
        )
        .join("");
      const cases = (a.cases || [])
        .map((q) => `<blockquote class="nls-case"><p>${escapeHtml(q.q)}</p><span>${escapeHtml(q.a)}</span></blockquote>`)
        .join("");
      return `<article class="nls-panel${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="age" data-nls-key="${escapeHtml(a.id)}"${hidden}>
        <p class="nls-panel__kicker">${escapeHtml(a.age)} · ${escapeHtml(a.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(a.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(a.intro)}</p>
        ${groups}
        ${cases ? `<p class="nls-mini">${escapeHtml(c.ui.caseLabel || "")}</p>${cases}` : ""}
        ${a.note ? `<p class="nls-note">${escapeHtml(a.note)}</p>` : ""}
      </article>`;
    })
    .join("");
  return `<div id="nls-ages" class="nls-block" data-hs-section>
    ${titleBlock("", c.ages.title, c.ages.lead)}
    <p class="nls-note">${escapeHtml(c.ui.ageNote)}</p>
    ${c.ui.teenNote ? `<p class="nls-note">${escapeHtml(c.ui.teenNote)}</p>` : ""}
    <div class="nls-split">
      <div class="nls-tabs nls-tabs--ages" role="tablist">${tabs}</div>
      <div class="nls-panels">${panels}</div>
    </div>
  </div>`;
}

function sitsBlock(c) {
  const cards = c.sits.items
    .map((s, i) => tabBtn("sit", s.id, escapeHtml(s.title), i === 0, " nls-sit"))
    .join("");
  const panels = c.sits.items
    .map((s, i) => {
      const hidden = i === 0 ? "" : " hidden";
      return `<article class="nls-panel nls-sit-panel${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="sit" data-nls-key="${escapeHtml(s.id)}"${hidden}>
        <h4 class="nls-panel__title">${escapeHtml(s.title)}</h4>
        ${s.desc ? `<p class="nls-mini">${escapeHtml(c.ui.sitDesc || "")}</p><p class="nls-panel__intro">${escapeHtml(s.desc)}</p>` : ""}
        <div class="nls-sit-grid">
          <div><p class="nls-mini">${escapeHtml(c.sits.kLabel)}</p><p>${escapeHtml(s.knowledge)}</p></div>
          <div><p class="nls-mini">${escapeHtml(c.sits.gLabel)}</p><p>${escapeHtml(s.plan)}</p></div>
          ${s.tools ? `<div><p class="nls-mini">${escapeHtml(c.ui.toolsLabel || "Life Stage")}</p><p>${escapeHtml(s.tools)}</p></div>` : ""}
          ${s.apps ? `<div><p class="nls-mini">${escapeHtml(c.ui.appsLabel || "Newon")}</p><p>${escapeHtml(s.apps)}</p></div>` : ""}
          <div><p class="nls-mini">${escapeHtml(c.sits.cLabel)}</p><p>${escapeHtml(s.connect)}</p></div>
        </div>
      </article>`;
    })
    .join("");
  return `<div id="nls-sits" class="nls-block" data-hs-section>
    ${titleBlock("", c.sits.title, c.sits.lead)}
    ${badge(c.ui.preview, "preview")}
    <div class="nls-sit-wrap">
      <div class="nls-sit-cards" role="tablist">${cards}</div>
      <div class="nls-panels">${panels}</div>
    </div>
  </div>`;
}

function knowledgeBlock(c) {
  const cards = c.knowledge.fields
    .map((f, i) => {
      const on = i === 0;
      return `<button type="button" class="nls-know${on ? " is-active" : ""}" data-nls-tab data-nls-group="know" data-nls-key="${escapeHtml(f.id)}" aria-pressed="${on ? "true" : "false"}">
        <span class="nls-know__n">${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(f.name)}</strong>
      </button>`;
    })
    .join("");
  const panels = c.knowledge.fields
    .map((f, i) => {
      const on = i === 0;
      return `<article class="nls-panel${on ? " is-active" : ""}" data-nls-panel data-nls-group="know" data-nls-key="${escapeHtml(f.id)}"${on ? "" : " hidden"}>
        <p class="nls-panel__kicker">${escapeHtml(f.name)}</p>
        ${list(f.points, "nls-points")}
        <p class="nls-mini">${escapeHtml(c.ui.inDev)}</p>
        ${list(f.topics, "nls-chips")}
      </article>`;
    })
    .join("");
  return `<div id="nls-knowledge" class="nls-block" data-hs-section>
    ${titleBlock("", c.knowledge.title, c.knowledge.lead)}
    <div class="nls-know-grid">${cards}</div>
    <div class="nls-panels nls-panels--wide">${panels}</div>
  </div>`;
}

function learnBlock(c) {
  const lessons = c.knowledge.lessons || [
    { id: "lease", title: c.knowledge.learnTitle, lead: c.knowledge.learnLead, steps: c.knowledge.steps },
  ];
  const tabs = lessons.map((l, i) => tabBtn("learn", l.id, escapeHtml(l.label || l.title), i === 0)).join("");
  const panes = lessons
    .map((l, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const steps = (l.steps || [])
        .map((s, n) => {
          const bits = [
            s.concept ? `<p><em>${escapeHtml(c.ui.methods ? c.knowledge.methods[0] : "Concept")}</em> ${escapeHtml(s.concept)}</p>` : "",
            s.term ? `<p><em>${escapeHtml((c.knowledge.methods || [])[1] || "Term")}</em> ${escapeHtml(s.term)}</p>` : "",
            s.case ? `<p><em>${escapeHtml((c.knowledge.methods || [])[2] || "Case")}</em> ${escapeHtml(s.case)}</p>` : "",
            s.quiz ? `<p><em>${escapeHtml((c.knowledge.methods || [])[4] || "Quiz")}</em> ${escapeHtml(s.quiz)}</p>` : "",
            s.checklist ? `<p><em>${escapeHtml((c.knowledge.methods || [])[5] || "Checklist")}</em> ${escapeHtml(s.checklist)}</p>` : "",
            s.source ? `<p><em>${escapeHtml((c.knowledge.methods || [])[6] || "Source")}</em> ${escapeHtml(s.source)}</p>` : "",
          ].join("");
          return `<li class="nls-learn__step${n === 0 ? " is-open" : ""}">
            <button type="button" class="nls-learn__btn" data-nls-learn="${n}" aria-expanded="${n === 0 ? "true" : "false"}">
              <span>${escapeHtml(s.n)}</span>${escapeHtml(s.title)}
            </button>
            <p>${escapeHtml(s.body)}</p>
            ${bits ? `<div class="nls-learn__meta">${bits}</div>` : ""}
          </li>`;
        })
        .join("");
      return `<aside class="nls-learn${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="learn" data-nls-key="${escapeHtml(l.id)}"${hidden}>
        <p class="nls-mini">${escapeHtml(c.ui.learnPreview || c.knowledge.learnKicker)} · ${escapeHtml(c.ui.preview)}</p>
        <h4>${escapeHtml(l.title)}</h4>
        <p class="nls-learn__lead">${escapeHtml(l.lead || "")}</p>
        ${c.knowledge.methods ? list(c.knowledge.methods, "nls-chips") : ""}
        <ol class="nls-learn__list">${steps}</ol>
      </aside>`;
    })
    .join("");
  return `<div id="nls-learn" class="nls-block" data-hs-section>
    ${titleBlock("", c.knowledge.learnSectionTitle || c.knowledge.learnKicker, c.knowledge.learnSectionLead || "")}
    <div class="nls-tabs nls-tabs--learn" role="tablist">${tabs}</div>
    ${panes}
    <p class="nls-note">${escapeHtml(c.knowledge.metaNote)}</p>
  </div>`;
}

function aiBlock(c) {
  const chips = c.ai.prompts
    .map((p, i) => tabBtn("ai", p.id, escapeHtml(p.label), i === 0))
    .join("");
  const panes = c.ai.prompts
    .map((p, i) => {
      const hidden = i === 0 ? "" : " hidden";
      return `<div class="nls-chat${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="ai" data-nls-key="${escapeHtml(p.id)}"${hidden}>
        <p class="nls-chat__q"><span>Q</span>${escapeHtml(p.q)}</p>
        <p class="nls-chat__a"><span>A</span>${escapeHtml(p.a)}</p>
      </div>`;
    })
    .join("");
  return `<div id="nls-ai" class="nls-block" data-hs-section>
    ${titleBlock("", c.ai.title, c.ai.lead)}
    <div class="nls-two">
      <div>
        ${badge(c.ui.upcoming, "planned")}
        ${list(c.ai.features, "nls-points")}
      </div>
      <div class="nls-demo">
        ${badge(c.ui.aiPreview || c.ui.preview, "preview")}
        <div class="nls-tabs nls-tabs--ai" role="tablist">${chips}</div>
        ${panes}
      </div>
    </div>
  </div>`;
}

function plannerBlock(c) {
  const projects = c.planner.projects || [{ id: "move", title: c.planner.demoTitle, items: c.planner.items }];
  const tabs = projects.map((p, i) => tabBtn("plan", p.id, escapeHtml(p.title), i === 0)).join("");
  const panes = projects
    .map((p, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const items = (p.items || [])
        .map(
          (t, n) => `<label class="nls-check">
            <input type="checkbox" data-nls-check ${n < 2 ? "checked" : ""} />
            <span>${escapeHtml(t)}</span>
          </label>`
        )
        .join("");
      return `<div class="nls-plan-pane${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="plan" data-nls-key="${escapeHtml(p.id)}"${hidden}>
        <div class="nls-plan-head">
          <h4>${escapeHtml(p.title)}</h4>
          <p class="nls-progress" data-nls-progress><span>${escapeHtml(c.ui.progress)}</span> <strong>2 / ${p.items.length}</strong></p>
        </div>
        <div class="nls-bar" aria-hidden="true"><i data-nls-bar style="width:33%"></i></div>
        <div class="nls-checks">${items}</div>
      </div>`;
    })
    .join("");
  const later = (c.planner.later || [])
    .map((x) => `<div class="nls-later"><strong>${escapeHtml(x.title)}</strong><p>${escapeHtml(x.body)}</p>${badge(c.ui.upcoming, "planned")}</div>`)
    .join("");
  return `<div id="nls-planner" class="nls-block" data-hs-section>
    ${titleBlock("", c.planner.title, c.planner.lead)}
    <div class="nls-two">
      <div>
        ${badge(c.ui.upcoming, "planned")}
        ${list(c.planner.features, "nls-points")}
      </div>
      <div class="nls-demo">
        ${badge(c.planner.previewLabel || c.ui.preview, "preview")}
        <div class="nls-tabs nls-tabs--plan" role="tablist">${tabs}</div>
        ${panes}
        <p class="nls-note">${escapeHtml(c.planner.localNote)}</p>
        <div class="nls-later-row">${later}</div>
      </div>
    </div>
  </div>`;
}

function statusLabel(c, item) {
  return item.status === "expand" ? c.ui.expand : c.ui.planned;
}

function platformBlock(c) {
  const core = c.platform.items.filter((x) => x.layer === "core");
  const expand = c.platform.items.filter((x) => x.layer === "expand");
  const org = c.platform.items.filter((x) => x.layer === "enterprise");
  const pill = (item, i) =>
    `<button type="button" class="nls-venture nls-venture--${escapeHtml(item.layer)}${i === 0 && item.layer === "core" ? " is-active" : ""}" data-nls-tab data-nls-group="venture" data-nls-key="${escapeHtml(item.id)}" aria-pressed="${i === 0 && item.layer === "core" ? "true" : "false"}">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.blurb)}</span>
    </button>`;
  const panels = c.platform.items
    .map((item, i) => {
      const on = i === 0;
      return `<article class="nls-panel${on ? " is-active" : ""}" data-nls-panel data-nls-group="venture" data-nls-key="${escapeHtml(item.id)}"${on ? "" : " hidden"}>
        <p class="nls-panel__kicker">${escapeHtml(item.name)} · ${escapeHtml(statusLabel(c, item))}</p>
        <h4 class="nls-panel__title">${escapeHtml(item.blurb)}</h4>
        ${list(item.features, "nls-points")}
        <p class="nls-example">${escapeHtml(item.example)}</p>
      </article>`;
    })
    .join("");
  return `<div id="nls-platform" class="nls-block" data-hs-section>
    ${titleBlock("", c.platform.title, c.platform.lead)}
    <div class="nls-map">
      <p class="nls-map__hub">LIFE STAGE</p>
      <p class="nls-mini">${escapeHtml(c.ui.core)}</p>
      <div class="nls-map__row nls-map__row--core">${core.map((x, i) => pill(x, i)).join("")}</div>
      <p class="nls-mini">${escapeHtml(c.ui.expand)}</p>
      <div class="nls-map__row">${expand.map((x) => pill(x, 1)).join("")}</div>
      <p class="nls-mini">${escapeHtml(c.ui.enterprise)}</p>
      <div class="nls-map__row">${org.map((x) => pill(x, 1)).join("")}</div>
    </div>
    <div class="nls-panels nls-panels--wide">${panels}</div>
  </div>`;
}

function flowBlock(c) {
  const tabs = c.flow.cases
    .map((x, i) => tabBtn("flow", x.id, escapeHtml(x.label), i === 0))
    .join("");
  const panels = c.flow.cases
    .map((x, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const steps = x.steps
        .map(
          (s, n) => `<li>
            <span class="nls-flow__n">${String(n + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(s.t)}</strong>
            <p>${escapeHtml(s.d)}</p>
          </li>`
        )
        .join("");
      return `<ol class="nls-flow${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="flow" data-nls-key="${escapeHtml(x.id)}"${hidden}>${steps}</ol>`;
    })
    .join("");
  return `<div id="nls-flow" class="nls-block" data-hs-section>
    ${titleBlock("", c.flow.title, "")}
    <div class="nls-tabs nls-tabs--flow" role="tablist">${tabs}</div>
    ${panels}
  </div>`;
}

function connectBlock(c) {
  const comm = c.community || {};
  return `<div id="nls-connect" class="nls-block" data-hs-section>
    ${titleBlock("", c.connect.title, "")}
    <div class="nls-three">
      ${comm.title ? `<article class="nls-card">
        <h4>${escapeHtml(comm.title)}</h4>
        <p>${escapeHtml(comm.lead || "")}</p>
        <p class="nls-mini">${escapeHtml(c.ui.upcoming)}</p>
        ${list(comm.features || [], "nls-points")}
        ${comm.safety ? `<p class="nls-note">${escapeHtml(comm.safety)}</p>` : ""}
      </article>` : ""}
      <article class="nls-card">
        <h4>${escapeHtml(c.connect.expertTitle)}</h4>
        <p>${escapeHtml(c.connect.expertLead)}</p>
        ${list(c.connect.expertFields, "nls-chips")}
        <p class="nls-mini">${escapeHtml(c.ui.upcoming)}</p>
        ${list(c.connect.expertFuture, "nls-points")}
      </article>
      <article class="nls-card">
        <h4>${escapeHtml(c.connect.servicesTitle)}</h4>
        <p>${escapeHtml(c.connect.servicesLead)}</p>
        ${list(c.connect.serviceFields, "nls-chips")}
        <p class="nls-mini">${escapeHtml(c.ui.upcoming)}</p>
        ${list(c.connect.serviceFuture, "nls-points")}
      </article>
    </div>
    <p class="nls-note">${escapeHtml(c.connect.note)}</p>
  </div>`;
}

function ecoBlock(c, lang) {
  const groups = c.eco.groups
    .map((g) => {
      const apps = g.slugs
        .map((slug) => {
          const app = APP_BY_SLUG[slug];
          if (!app) return "";
          const hash = app.homeHash || `#${slug}`;
          const href = hash.startsWith("#") ? `/${lang}/${hash}` : hash;
          const name = app.label || app.name;
          const icon = app.icon || `/${slug}-logo.png`;
          return `<a class="nls-app" href="${escapeHtml(href)}">
            <img src="${escapeHtml(icon)}" alt="" width="28" height="28" loading="lazy" decoding="async" />
            <span>${escapeHtml(name)}</span>
          </a>`;
        })
        .join("");
      return `<div class="nls-eco-group">
        <p class="nls-mini">${escapeHtml(g.title)}</p>
        <div class="nls-app-row">${apps}</div>
      </div>`;
    })
    .join("");
  return `<div id="nls-eco" class="nls-block" data-hs-section>
    ${titleBlock("", c.eco.title, c.eco.lead)}
    <p class="nls-mini">${escapeHtml(c.ui.availableNow)}</p>
    <div class="nls-eco">${groups}</div>
    <article class="nls-ongil">
      <p class="nls-mini">${escapeHtml(c.eco.ongilName)} · ${escapeHtml(c.eco.ongilTitle)}</p>
      <p>${escapeHtml(c.eco.ongilLead)}</p>
      <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/#story-ongil">${escapeHtml(c.eco.ongilCta)}</a>
    </article>
    <p class="nls-note">${escapeHtml(c.ui.futureLink)}</p>
  </div>`;
}

function revenueBlock(c) {
  const cols = c.revenue.pillars
    .map(
      (p, i) => `<article class="nls-rev nls-rev--${i + 1}">
        <p class="nls-mini">0${i + 1}</p>
        <h4>${escapeHtml(p.title)}</h4>
        ${list(p.items, "nls-points")}
      </article>`
    )
    .join("");
  return `<div id="nls-revenue" class="nls-block" data-hs-section>
    ${titleBlock("", c.revenue.title, c.revenue.lead)}
    <p class="nls-note">${escapeHtml(c.ui.revenueNote)}</p>
    <div class="nls-rev-row">${cols}</div>
  </div>`;
}

function roadmapBlock(c) {
  const steps = c.roadmap.steps
    .map(
      (s) => `<li>
        <span>${escapeHtml(s.n)}</span>
        <strong>${escapeHtml(s.title)}</strong>
        <p>${escapeHtml(s.body)}</p>
      </li>`
    )
    .join("");
  return `<div id="nls-roadmap" class="nls-block" data-hs-section>
    ${titleBlock("", c.roadmap.title, "")}
    <p class="nls-note">${escapeHtml(c.ui.roadmapNote)}</p>
    <ol class="nls-road">${steps}</ol>
  </div>`;
}

function heroBlock(c, lang) {
  return `<div class="nls-crumb">
      <a href="/${escapeHtml(lang)}/">NEWON</a>
      <span aria-hidden="true">/</span>
      <span>LIFE STAGE</span>
    </div>
    <div class="nls-hero" data-hs-section>
    <div class="nls-hero__grid">
      <div class="nls-hero__copy">
        <p class="nls-kicker">${escapeHtml(c.hero.kicker)}<span class="nls-kicker__sep" aria-hidden="true">·</span><span>${escapeHtml(c.hero.theme)}</span></p>
        <h1 id="story-lifestage-title" class="nls-hero__title">${c.hero.titleHtml}</h1>
        <p class="nls-lead">${escapeHtml(c.hero.lead)}</p>
        <div class="nls-actions">
          <a class="nls-btn" href="#nls-ages" data-nls-scroll>${escapeHtml(c.hero.ctaMain)} →</a>
          <a class="nls-btn nls-btn--ghost" href="#nls-knowledge" data-nls-scroll>${escapeHtml(c.hero.ctaSub)}</a>
        </div>
        <p class="nls-note">${escapeHtml(c.hero.status)}</p>
      </div>
      ${heroTimeline(c)}
    </div>
  </div>`;
}

function closeBlock(c, lang) {
  const inquiry = `/${lang}/business/inquiry/`;
  return `<div id="nls-close" class="nls-block nls-close" data-hs-section>
    <p class="nls-kicker">${escapeHtml(c.close.kicker)}</p>
    <h2 class="nls-hero__title">${c.close.titleHtml}</h2>
    <p class="nls-lead">${escapeHtml(c.close.lead)}</p>
    <div class="nls-actions">
      <a class="nls-btn" href="${escapeHtml(inquiry)}">${escapeHtml(c.close.ctaMain)} →</a>
      <a class="nls-btn nls-btn--ghost" href="/${escapeHtml(lang)}/#story-ecosystem">${escapeHtml(c.close.ctaSub)}</a>
    </div>
  </div>`;
}

/** @param {string} lang */
export function renderLifeStageSection(lang, opts = {}) {
  const L = lang || "en";
  const c = getLifeStageCopy(L);
  const back = opts.detail
    ? `<p class="nls-closebar"><a class="nls-btn nls-btn--ghost" href="/${escapeHtml(L)}/#story-lifestage">${escapeHtml(c.ui.back || c.ui.close)}</a></p>`
    : "";
  return `<section id="lifestage-detail" class="nls" data-story="lifestage" aria-labelledby="story-lifestage-title">
  <div class="nls__wrap">
    ${back}
    ${heroBlock(c, L)}
    ${agesBlock(c)}
    ${sitsBlock(c)}
    ${knowledgeBlock(c)}
    ${learnBlock(c)}
    ${aiBlock(c)}
    ${plannerBlock(c)}
    ${platformBlock(c)}
    ${flowBlock(c)}
    ${connectBlock(c)}
    ${ecoBlock(c, L)}
    ${revenueBlock(c)}
    ${roadmapBlock(c)}
    ${closeBlock(c, L)}
  </div>
</section>`;
}
