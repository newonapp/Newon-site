/**
 * Life Stage detail section HTML. Scoped to #lifestage-detail.
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
    <h2 class="nls-title">${nl(title)}</h2>
    ${lead ? `<p class="nls-lead">${escapeHtml(lead)}</p>` : ""}
  </header>`;
}

function badge(label, kind = "planned") {
  return `<span class="nls-badge nls-badge--${escapeHtml(kind)}">${escapeHtml(label)}</span>`;
}

function list(items, cls = "nls-list") {
  return `<ul class="${cls}">${(items || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`;
}

function moreBlock(label, inner) {
  if (!inner) return "";
  return `<details class="nls-more"><summary>${escapeHtml(label)}</summary><div class="nls-more__body">${inner}</div></details>`;
}

function emptyHint(group, text, startHidden = false) {
  return `<p class="nls-empty" data-nls-empty="${escapeHtml(group)}"${startHidden ? " hidden" : ""}>${escapeHtml(text)}</p>`;
}

const APP_NAME_SLUG = {
  BabyLog: "babylog",
  PetLog: "petlog",
  SAVY: "savy",
  Savy: "savy",
  Pillmate: "pillmate",
  GoalUp: "goalup",
  CountUp: "countup",
  SubPing: "subping",
  PiggyUp: "piggyup",
  "OX MONTH": "ox-month",
  "My World": "myworld",
};

function serviceChip(lang, name) {
  const slug = APP_NAME_SLUG[name];
  if (slug && APP_BY_SLUG[slug]) {
    return `<a class="nls-first-svc" href="/${escapeHtml(lang)}/${escapeHtml(slug)}/">${escapeHtml(name)}</a>`;
  }
  return `<span class="nls-first-svc nls-first-svc--plain">${escapeHtml(name)}</span>`;
}

function firstGroupOf(fm, id) {
  return (fm.groups || []).find((g) => (g.ids || []).includes(id)) || null;
}

function firstLinksForAge(c, ageId) {
  const fm = c.firstMoments;
  if (!fm) return "";
  const ids = (fm.ageMap && fm.ageMap[ageId]) || [];
  const byId = Object.fromEntries((fm.items || []).map((it) => [it.id, it]));
  const chips = ids
    .map((id) => {
      const it = byId[id];
      if (!it) return "";
      return `<button type="button" class="nls-first-mini" data-nls-jump="first:${escapeHtml(id)}">${escapeHtml(it.name)}</button>`;
    })
    .join("");
  if (!chips) return "";
  return `<div class="nls-first-age"><p class="nls-mini">${escapeHtml(fm.ageLink || "")}</p><div class="nls-first-age__row">${chips}</div></div>`;
}

function firstKeys(it) {
  return [it.name, it.question, it.keywords, it.situation, ...(it.knowledge || []), ...(it.checklist || [])]
    .filter(Boolean)
    .join(" ");
}

function jumpBtn(spec, label) {
  if (!spec || !label) return "";
  return `<button type="button" class="nls-btn nls-btn--ghost nls-first-jump" data-nls-jump="${escapeHtml(spec)}">${escapeHtml(label)}</button>`;
}

function firstAcc(open, summary, inner) {
  if (!inner) return "";
  return `<details class="nls-first-acc"${open ? " open" : ""}><summary>${escapeHtml(summary)}</summary><div class="nls-first-acc__body">${inner}</div></details>`;
}

function firstMomentsBlock(c, lang) {
  const fm = c.firstMoments;
  if (!fm || !(fm.items || []).length) return "";
  const byId = Object.fromEntries(fm.items.map((it) => [it.id, it]));
  const featured = new Set(fm.featured || []);
  const planIds = new Set((c.planner.projects || []).map((p) => p.id));
  const aiIds = new Set((c.ai.prompts || []).map((p) => p.id));
  const sitIds = new Set((c.sits.items || []).map((s) => s.id));
  const knowIds = new Set((c.knowledge.fields || []).map((f) => f.id));
  const learnIds = new Set((c.knowledge.lessons || []).map((l) => l.id));

  const groups = (fm.groups || [])
    .map((g) => {
      const names = (g.ids || [])
        .map((id) => (byId[id] || {}).name)
        .filter(Boolean)
        .slice(0, 3)
        .join(" · ");
      return `<button type="button" class="nls-tab nls-first-g" data-nls-filter="firstg" data-nls-key="${escapeHtml(g.id)}" aria-pressed="false">
        <strong>${escapeHtml(g.name)}</strong>
        ${names ? `<em>${escapeHtml(names)}</em>` : ""}
      </button>`;
    })
    .join("");

  const examples = (fm.searchExamples || [])
    .map((ex) => `<button type="button" class="nls-first-ex" data-nls-search-ex="${escapeHtml(ex)}">${escapeHtml(ex)}</button>`)
    .join("");

  const cards = fm.items
    .map((it) => {
      const g = firstGroupOf(fm, it.id);
      const isFeat = featured.has(it.id) || it.featured;
      const hidden = isFeat ? "" : " hidden";
      return tabBtn(
        "first",
        it.id,
        `<strong>${escapeHtml(it.name)}</strong><span>${escapeHtml(it.question)}</span>`,
        false,
        " nls-first-card",
        ` data-nls-filter-item="firstg" data-nls-cat="${escapeHtml(g ? g.id : "")}" data-nls-featured="${isFeat ? "1" : "0"}" data-nls-keys="${escapeHtml(firstKeys(it))}"${hidden}`
      );
    })
    .join("");

  const panels = fm.items
    .map((it) => {
      const g = firstGroupOf(fm, it.id);
      const qList = (it.questions || []).length ? list(it.questions, "nls-list") : "";
      const know = list(it.knowledge, "nls-points");
      const prep = list(it.checklist, "nls-list");
      const steps = `<ol class="nls-first-steps">${(it.steps || [])
        .map((s) => `<li><span>${escapeHtml(s.n || "")}</span>${escapeHtml(s.t || s.title || "")}</li>`)
        .join("")}</ol>`;
      const localChecks = `<div class="nls-checks">${(it.checklist || [])
        .map((t) => `<label class="nls-check"><input type="checkbox" /><span>${escapeHtml(t)}</span></label>`)
        .join("")}</div><p class="nls-note">${escapeHtml(fm.planNote || "")}</p>`;
      const planJump = it.planId && planIds.has(it.planId) ? jumpBtn(`plan:${it.planId}`, fm.jumpPlan || fm.planCta) : "";
      const aiJump = it.aiId && aiIds.has(it.aiId) ? jumpBtn(`ai:${it.aiId}`, fm.jumpAi) : "";
      const sitJump = (it.sitIds || [])
        .filter((id) => sitIds.has(id))
        .slice(0, 2)
        .map((id) => jumpBtn(`sit:${id}`, fm.jumpSit))
        .join("");
      const knowJump = (it.knowIds || [])
        .filter((id) => knowIds.has(id))
        .slice(0, 2)
        .map((id) => jumpBtn(`know:${id}`, fm.jumpKnow))
        .join("");
      const learnJump = it.learnId && learnIds.has(it.learnId) ? jumpBtn(`learn:${it.learnId}`, fm.jumpLearn) : "";
      const apps = (it.apps || []).map((name) => serviceChip(lang, name)).join("");
      const nexts = (it.next || [])
        .map((id) => {
          const nx = byId[id];
          if (!nx) return "";
          return `<button type="button" class="nls-first-mini" data-nls-jump="first:${escapeHtml(id)}">${escapeHtml(nx.name)}</button>`;
        })
        .join("");
      const linkInner = [
        it.tools ? `<p>${escapeHtml(it.tools)}</p>` : "",
        apps ? `<div class="nls-first-svcs">${apps}</div>` : "",
        `<div class="nls-first-jumps">${[planJump, aiJump, sitJump, knowJump, learnJump].join("")}</div>`,
      ].join("");
      return `<article class="nls-panel nls-first-panel" data-nls-panel data-nls-group="first" data-nls-key="${escapeHtml(it.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(g ? g.name : "")}${g ? " · " : ""}${escapeHtml(it.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(it.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(it.question)}</p>
        <div class="nls-first-guide">
          ${firstAcc(true, fm.panelSit || fm.sitLabel, `<p>${escapeHtml(it.situation || "")}</p>${qList}`)}
          ${firstAcc(false, fm.panelKnow || fm.knowLabel, know)}
          ${firstAcc(false, fm.panelPrep || fm.prepLabel, prep)}
          ${firstAcc(false, fm.panelStep || fm.stepLabel, steps)}
          ${firstAcc(false, fm.panelPlan || fm.planLabel, `${localChecks}${planJump}`)}
          ${firstAcc(false, fm.panelLink || fm.linkLabel, linkInner)}
          ${firstAcc(false, fm.panelNext || fm.nextLabel, `<div class="nls-first-age__row">${nexts}</div>`)}
        </div>
        ${it.official ? `<p class="nls-note">${escapeHtml(fm.official || "")} ${escapeHtml(it.official)}</p>` : ""}
      </article>`;
    })
    .join("");

  return `<div id="nls-first" class="nls-block" data-hs-section>
    ${titleBlock(fm.kicker, fm.title, fm.lead)}
    <p class="nls-note">${escapeHtml(fm.ageNote || "")}</p>
    <form class="nls-first-search" role="search" action="#" onsubmit="return false">
      <label class="nls-first-search__label" for="nls-first-q">${escapeHtml(fm.searchLabel)}</label>
      <input id="nls-first-q" class="nls-first-search__input" type="search" enterkeyhint="search" autocomplete="off" data-nls-search="first" placeholder="${escapeHtml(fm.searchPh || "")}" />
      <p class="nls-note">${escapeHtml(fm.searchHint || "")}</p>
      <div class="nls-first-exs">${examples}</div>
      <ul class="nls-first-hits" data-nls-search-out hidden></ul>
      <p class="nls-empty" data-nls-search-empty hidden>${escapeHtml(fm.searchEmpty || "")}</p>
    </form>
    <p class="nls-mini">${escapeHtml(fm.groupLabel || "")}</p>
    <div class="nls-first-groups" role="group">${groups}
      <button type="button" class="nls-tab nls-first-g nls-first-g--feat" data-nls-first-featured aria-pressed="true">
        <strong>${escapeHtml(fm.featuredLabel || "")}</strong>
      </button>
    </div>
    ${emptyHint("firstg", fm.pickGroup, true)}
    <div class="nls-first-cards" role="tablist">${cards}</div>
    ${emptyHint("first", fm.pickTopic, true)}
    <div class="nls-panels nls-panels--wide">${panels}</div>
  </div>`;
}


function tabBtn(group, key, label, selected, extraClass = "", extraAttr = "") {
  return `<button type="button" class="nls-tab${extraClass}${selected ? " is-active" : ""}" data-nls-tab data-nls-group="${escapeHtml(group)}" data-nls-key="${escapeHtml(key)}"${extraAttr} role="tab" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}">${label}</button>`;
}

function sitCatOf(c, sitId) {
  const cat = (c.sitCats || []).find((g) => (g.sitIds || []).includes(sitId));
  return cat ? cat.id : "";
}

function knowCatOf(c, fieldId) {
  const g = (c.knowGroups || []).find((x) => (x.fieldIds || []).includes(fieldId));
  return g ? g.id : "";
}

function heroTimeline(c) {
  const nodes = c.ages.items
    .map((a, i) => {
      return `<button type="button" class="nls-node" data-nls-tab data-nls-group="age" data-nls-key="${escapeHtml(a.id)}" data-name="${escapeHtml(a.name)}" data-age="${escapeHtml(a.age)}" aria-pressed="false">
        <span class="nls-node__n">${String(i + 1).padStart(2, "0")}</span>
        <span class="nls-node__age">${escapeHtml(a.age)}</span>
        <span class="nls-node__name">${escapeHtml(a.name)}</span>
      </button>`;
    })
    .join("");
  const all = c.ui.allStages;
  const allSub = c.ui.allStagesSub;
  return `<div class="nls-visual" aria-label="${escapeHtml(c.hero.theme)}">
    <div class="nls-sv">
      <div class="nls-sv__head">
        <span class="nls-sv__live"><i></i> LIFE TIMELINE</span>
        <span class="nls-sv__meta">DIRECTION</span>
      </div>
      <div class="nls-sv__rail">${nodes}</div>
      <div class="nls-sv__grid">
        <article class="nls-sv__now" data-nls-now data-default-title="${escapeHtml(all)}" data-default-age="${escapeHtml(allSub)}">
          <p class="nls-sv__k">NOW</p>
          <strong data-nls-now-title>${escapeHtml(all)}</strong>
          <em data-nls-now-age>${escapeHtml(allSub)}</em>
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
    .map((a) => {
      const hi = (a.highlights || a.topics || []).slice(0, 3);
      const topics = hi.map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      return tabBtn(
        "age",
        a.id,
        `<span class="nls-age-tab__age">${escapeHtml(a.age)}</span><strong class="nls-age-tab__name">${escapeHtml(a.name)}</strong><ul class="nls-age-tab__topics">${topics}</ul>`,
        false,
        " nls-age-tab"
      );
    })
    .join("");
  const panels = c.ages.items
    .map((a) => {
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
      const extra = [
        groups,
        cases ? `<p class="nls-mini">${escapeHtml(c.ui.caseLabel || "")}</p>${cases}` : "",
        a.note ? `<p class="nls-note">${escapeHtml(a.note)}</p>` : "",
        a.id === "10" && c.ui.teenNote ? `<p class="nls-note">${escapeHtml(c.ui.teenNote)}</p>` : "",
        firstLinksForAge(c, a.id),
      ].join("");
      return `<article class="nls-panel" data-nls-panel data-nls-group="age" data-nls-key="${escapeHtml(a.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(a.age)} · ${escapeHtml(a.name)}</p>
        <h4 class="nls-panel__title">${escapeHtml(a.name)}</h4>
        <p class="nls-panel__intro">${escapeHtml(a.intro)}</p>
        ${list((a.highlights || []).slice(0, 3), "nls-chips")}
        ${moreBlock(c.ui.more, extra)}
      </article>`;
    })
    .join("");
  return `<div id="nls-ages" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock("01 · Journey", c.ages.title, c.ages.lead)}
    <p class="nls-note">${escapeHtml(c.ui.ageNote)}</p>
    <div class="nls-age-board">
      <div class="nls-tabs nls-tabs--ages" role="tablist">${tabs}</div>
      ${emptyHint("age", c.ui.pickAge)}
      <div class="nls-panels">${panels}</div>
    </div>
  </div>`;
}

function sitsBlock(c) {
  const cats = (c.sitCats || [])
    .map(
      (cat) => `<button type="button" class="nls-tab nls-sitcat" data-nls-filter="sitcat" data-nls-key="${escapeHtml(cat.id)}" aria-pressed="false">
        <span class="nls-sit__n">${escapeHtml(cat.n)}</span>
        <strong>${escapeHtml(cat.title)}</strong>
        ${cat.blurb ? `<em>${escapeHtml(cat.blurb)}</em>` : ""}
      </button>`
    )
    .join("");
  const cards = c.sits.items
    .map((s, i) =>
      tabBtn(
        "sit",
        s.id,
        `<span class="nls-sit__n">${String(i + 1).padStart(2, "0")}</span><span>${escapeHtml(s.title)}</span>`,
        false,
        " nls-sit",
        ` data-nls-filter-item="sitcat" data-nls-cat="${escapeHtml(sitCatOf(c, s.id))}" hidden`
      )
    )
    .join("");
  const panels = c.sits.items
    .map((s) => {
      const extra = [
        s.apps ? `<div><p class="nls-mini">${escapeHtml(c.ui.appsLabel)}</p><p>${escapeHtml(s.apps)}</p></div>` : "",
        `<div><p class="nls-mini">${escapeHtml(c.sits.cLabel)}</p><p>${escapeHtml(s.connect)}</p></div>`,
      ].join("");
      return `<article class="nls-panel nls-sit-panel" data-nls-panel data-nls-group="sit" data-nls-key="${escapeHtml(s.id)}" hidden>
        <h4 class="nls-panel__title">${escapeHtml(s.title)}</h4>
        ${s.desc ? `<p class="nls-panel__intro">${escapeHtml(s.desc)}</p>` : ""}
        <div class="nls-sit-grid">
          <div><p class="nls-mini">${escapeHtml(c.sits.kLabel)}</p><p>${escapeHtml(s.knowledge)}</p></div>
          <div><p class="nls-mini">${escapeHtml(c.sits.gLabel)}</p><p>${escapeHtml(s.plan)}</p></div>
          ${s.tools ? `<div><p class="nls-mini">${escapeHtml(c.ui.toolsLabel)}</p><p>${escapeHtml(s.tools)}</p></div>` : ""}
        </div>
        ${moreBlock(c.ui.moreServices, `<div class="nls-sit-grid">${extra}</div>`)}
      </article>`;
    })
    .join("");
  return `<div id="nls-sits" class="nls-block" data-hs-section>
    ${titleBlock(c.ui.sitKicker, c.sits.title, c.sits.lead)}
    ${badge(c.ui.preview, "preview")}
    <div class="nls-sit-wrap">
      <div class="nls-sit-cats" role="group">${cats}</div>
      ${emptyHint("sitcat", c.ui.pickSitCat)}
      <div class="nls-sit-cards" role="tablist">${cards}</div>
      ${emptyHint("sit", c.ui.pickSit, true)}
      <div class="nls-panels">${panels}</div>
    </div>
  </div>`;
}

function knowledgeBlock(c) {
  const groups = (c.knowGroups || [])
    .map((g) => {
      const names = (g.fieldIds || [])
        .map((id) => (c.knowledge.fields.find((f) => f.id === id) || {}).name)
        .filter(Boolean);
      return `<button type="button" class="nls-know nls-know--group" data-nls-filter="knowg" data-nls-key="${escapeHtml(g.id)}" aria-pressed="false">
        <span class="nls-know__n">${escapeHtml(g.n)}</span>
        <strong>${escapeHtml(g.title)}</strong>
        <em>${names.map(escapeHtml).join(" · ")}</em>
      </button>`;
    })
    .join("");
  const cards = c.knowledge.fields
    .map((f, i) => {
      return `<button type="button" class="nls-know" data-nls-tab data-nls-group="know" data-nls-key="${escapeHtml(f.id)}" data-nls-filter-item="knowg" data-nls-cat="${escapeHtml(knowCatOf(c, f.id))}" aria-pressed="false" hidden>
        <span class="nls-know__n">${String(i + 1).padStart(2, "0")}</span>
        <strong>${escapeHtml(f.name)}</strong>
      </button>`;
    })
    .join("");
  const panels = c.knowledge.fields
    .map((f) => {
      return `<article class="nls-panel" data-nls-panel data-nls-group="know" data-nls-key="${escapeHtml(f.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(f.name)}</p>
        ${list(f.points, "nls-points")}
        ${moreBlock(c.ui.more, `<p class="nls-mini">${escapeHtml(c.ui.inDev)}</p>${list(f.topics, "nls-chips")}`)}
      </article>`;
    })
    .join("");
  return `<div id="nls-knowledge" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock("02 · Knowledge", c.knowledge.title, c.knowledge.lead)}
    <div class="nls-know-groups">${groups}</div>
    ${emptyHint("knowg", c.ui.pickKnow)}
    <div class="nls-know-grid">${cards}</div>
    <div class="nls-panels nls-panels--wide">${panels}</div>
  </div>`;
}

function learnBlock(c) {
  const lessons = c.knowledge.lessons || [
    { id: "lease", title: c.knowledge.learnTitle, lead: c.knowledge.learnLead, steps: c.knowledge.steps },
  ];
  const tabs = lessons.map((l, i) => tabBtn("learn", l.id, escapeHtml(l.label || l.title), i === 0)).join("");
  const methodNames = c.knowledge.methods || [];
  const panes = lessons
    .map((l, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const steps = (l.steps || [])
        .map((s, n) => {
          const bits = [
            s.concept ? `<p><em>${escapeHtml(methodNames[0] || "Concept")}</em> ${escapeHtml(s.concept)}</p>` : "",
            s.term ? `<p><em>${escapeHtml(methodNames[1] || "Term")}</em> ${escapeHtml(s.term)}</p>` : "",
            s.case ? `<p><em>${escapeHtml(methodNames[2] || "Case")}</em> ${escapeHtml(s.case)}</p>` : "",
            s.quiz ? `<p><em>${escapeHtml(methodNames[4] || "Quiz")}</em> ${escapeHtml(s.quiz)}</p>` : "",
            s.checklist ? `<p><em>${escapeHtml(methodNames[5] || "Checklist")}</em> ${escapeHtml(s.checklist)}</p>` : "",
            s.source ? `<p><em>${escapeHtml(methodNames[6] || "Source")}</em> ${escapeHtml(s.source)}</p>` : "",
          ].join("");
          return `<li class="nls-learn__step${n === 0 ? " is-open" : ""}">
            <button type="button" class="nls-learn__btn" data-nls-learn="${n}" aria-expanded="${n === 0 ? "true" : "false"}">
              <span>${escapeHtml(s.n)}</span>${escapeHtml(s.title)}
            </button>
            <p>${escapeHtml(s.body)}</p>
            ${bits ? moreBlock(c.ui.moreLearn, `<div class="nls-learn__meta">${bits}</div>`) : ""}
          </li>`;
        })
        .join("");
      return `<aside class="nls-learn${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="learn" data-nls-key="${escapeHtml(l.id)}"${hidden}>
        <p class="nls-mini">${escapeHtml(c.ui.learnPreview)} · ${escapeHtml(c.ui.preview)}</p>
        <h4>${escapeHtml(l.title)}</h4>
        <p class="nls-learn__lead">${escapeHtml(l.lead || "")}</p>
        <ol class="nls-learn__list">${steps}</ol>
      </aside>`;
    })
    .join("");
  return `<div id="nls-learn" class="nls-block nls-block--ink" data-hs-section>
    ${titleBlock(c.ui.learnKicker, c.knowledge.learnSectionTitle || c.knowledge.learnKicker, c.knowledge.learnSectionLead || "")}
    <div class="nls-tabs nls-tabs--learn" role="tablist">${tabs}</div>
    ${panes}
    <p class="nls-note">${escapeHtml(c.knowledge.metaNote)}</p>
  </div>`;
}

function aiInner(c) {
  const chips = c.ai.prompts.map((p, i) => tabBtn("ai", p.id, escapeHtml(p.label), i === 0)).join("");
  const panes = c.ai.prompts
    .map((p, i) => {
      const hidden = i === 0 ? "" : " hidden";
      return `<div class="nls-chat${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="ai" data-nls-key="${escapeHtml(p.id)}"${hidden}>
        <p class="nls-chat__q"><span>Q</span>${escapeHtml(p.q)}</p>
        <p class="nls-chat__a"><span>A</span>${escapeHtml(p.a)}</p>
      </div>`;
    })
    .join("");
  const topFeatures = (c.ai.features || []).slice(0, 3);
  const restFeatures = (c.ai.features || []).slice(3);
  return `<div class="nls-core__pane">
    <h3 class="nls-sub">Life AI</h3>
    <p class="nls-lead nls-lead--tight">${escapeHtml(c.ai.lead)}</p>
    ${badge(c.ui.aiPreview, "preview")}
    <div class="nls-demo">
      <div class="nls-tabs nls-tabs--ai" role="tablist">${chips}</div>
      ${panes}
    </div>
    ${list(topFeatures, "nls-points")}
    ${moreBlock(c.ui.more, `${badge(c.ui.upcoming, "planned")}${list(restFeatures, "nls-points")}`)}
  </div>`;
}

function plannerInner(c) {
  const projects = c.planner.projects || [{ id: "move", title: c.planner.demoTitle, items: c.planner.items }];
  const tabs = projects.map((p, i) => tabBtn("plan", p.id, escapeHtml(p.title), i === 0)).join("");
  const panes = projects
    .map((p, i) => {
      const hidden = i === 0 ? "" : " hidden";
      const items = p.items || [];
      const visible = items.slice(0, 6);
      const rest = items.slice(6);
      const check = (t, n) => `<label class="nls-check">
            <input type="checkbox" data-nls-check ${n < 2 ? "checked" : ""} />
            <span>${escapeHtml(t)}</span>
          </label>`;
      return `<div class="nls-plan-pane${i === 0 ? " is-active" : ""}" data-nls-panel data-nls-group="plan" data-nls-key="${escapeHtml(p.id)}"${hidden}>
        <div class="nls-plan-head">
          <h4>${escapeHtml(p.title)}</h4>
          <p class="nls-progress" data-nls-progress><span>${escapeHtml(c.ui.progress)}</span> <strong>2 / ${items.length}</strong></p>
        </div>
        <div class="nls-bar" aria-hidden="true"><i data-nls-bar style="width:33%"></i></div>
        <div class="nls-checks">${visible.map((t, n) => check(t, n)).join("")}</div>
        ${rest.length ? moreBlock(c.ui.moreItems, `<div class="nls-checks">${rest.map((t, n) => check(t, n + visible.length)).join("")}</div>`) : ""}
      </div>`;
    })
    .join("");
  const later = (c.planner.later || [])
    .map((x) => `<div class="nls-later"><strong>${escapeHtml(x.title)}</strong><p>${escapeHtml(x.body)}</p></div>`)
    .join("");
  const topFeatures = (c.planner.features || []).slice(0, 3);
  const restFeatures = (c.planner.features || []).slice(3);
  return `<div class="nls-core__pane">
    <h3 class="nls-sub">Life Planner</h3>
    <p class="nls-lead nls-lead--tight">${escapeHtml(c.planner.lead)}</p>
    ${badge(c.planner.previewLabel || c.ui.preview, "preview")}
    <div class="nls-demo">
      <div class="nls-tabs nls-tabs--plan" role="tablist">${tabs}</div>
      ${panes}
      <p class="nls-note">${escapeHtml(c.planner.localNote)}</p>
      ${later ? moreBlock(c.ui.more, `<div class="nls-later-row">${later}</div>`) : ""}
    </div>
    ${list(topFeatures, "nls-points")}
    ${moreBlock(c.ui.more, `${badge(c.ui.upcoming, "planned")}${list(restFeatures, "nls-points")}`)}
  </div>`;
}

function coreBlock(c) {
  return `<div id="nls-core" class="nls-block" data-hs-section>
    ${titleBlock(c.ui.coreKicker, (c.core && c.core.title) || c.ai.title, (c.core && c.core.lead) || "")}
    <div class="nls-two nls-core-grid">
      ${aiInner(c)}
      ${plannerInner(c)}
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
  const pill = (item) =>
    `<button type="button" class="nls-venture nls-venture--${escapeHtml(item.layer)}" data-nls-tab data-nls-group="venture" data-nls-key="${escapeHtml(item.id)}" aria-pressed="false">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.blurb)}</span>
    </button>`;
  const panels = c.platform.items
    .map(
      (item) => `<article class="nls-panel" data-nls-panel data-nls-group="venture" data-nls-key="${escapeHtml(item.id)}" hidden>
        <p class="nls-panel__kicker">${escapeHtml(item.name)} · ${escapeHtml(statusLabel(c, item))}</p>
        <h4 class="nls-panel__title">${escapeHtml(item.blurb)}</h4>
        ${list(item.features, "nls-points")}
        <p class="nls-example">${escapeHtml(item.example)}</p>
      </article>`
    )
    .join("");
  return `<div id="nls-platform" class="nls-block" data-hs-section>
    ${titleBlock(c.ui.ecoKicker, c.platform.title, c.platform.lead)}
    <div class="nls-map">
      <p class="nls-map__hub">LIFE STAGE</p>
      <p class="nls-mini">${escapeHtml(c.ui.core)}</p>
      <div class="nls-map__row nls-map__row--core">${core.map((x) => pill(x)).join("")}</div>
      <p class="nls-mini">${escapeHtml(c.ui.expand)}</p>
      <div class="nls-map__row nls-map__row--expand">${expand.map((x) => pill(x)).join("")}</div>
      <p class="nls-mini">${escapeHtml(c.ui.enterprise)}</p>
      <div class="nls-map__row nls-map__row--org">${org.map((x) => pill(x)).join("")}</div>
      ${emptyHint("venture", c.ui.pickVenture)}
    </div>
    <div class="nls-panels nls-panels--wide">${panels}</div>
  </div>`;
}

function flowBlock(c) {
  const tabs = c.flow.cases.map((x, i) => tabBtn("flow", x.id, escapeHtml(x.label), i === 0)).join("");
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
  return `<div id="nls-flow" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.ui.flowKicker, c.flow.title, c.ui.flowLabel || "")}
    <div class="nls-tabs nls-tabs--flow" role="tablist">${tabs}</div>
    ${panels}
  </div>`;
}

function connectBlock(c) {
  const comm = c.community || {};
  return `<div id="nls-connect" class="nls-block" data-hs-section>
    ${titleBlock(c.ui.connectKicker, c.connect.title, "")}
    <div class="nls-three nls-three--connect">
      ${
        comm.title
          ? `<article class="nls-card">
        <p class="nls-mini">01</p>
        <h4>${escapeHtml(comm.title)}</h4>
        <p>${escapeHtml(c.connect.communityLead || comm.lead || "")}</p>
        ${moreBlock(c.ui.more, `${badge(c.ui.upcoming, "planned")}${list(comm.features || [], "nls-points")}${comm.safety ? `<p class="nls-note">${escapeHtml(comm.safety)}</p>` : ""}`)}
      </article>`
          : ""
      }
      <article class="nls-card">
        <p class="nls-mini">02</p>
        <h4>${escapeHtml(c.connect.expertTitle)}</h4>
        <p>${escapeHtml(c.connect.expertLead)}</p>
        ${moreBlock(c.ui.more, `${list(c.connect.expertFields, "nls-chips")}<p class="nls-mini">${escapeHtml(c.ui.upcoming)}</p>${list(c.connect.expertFuture, "nls-points")}`)}
      </article>
      <article class="nls-card">
        <p class="nls-mini">03</p>
        <h4>${escapeHtml(c.connect.servicesTitle)}</h4>
        <p>${escapeHtml(c.connect.servicesLead)}</p>
        ${moreBlock(c.ui.more, `${list(c.connect.serviceFields, "nls-chips")}<p class="nls-mini">${escapeHtml(c.ui.upcoming)}</p>${list(c.connect.serviceFuture, "nls-points")}`)}
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
  return `<div id="nls-eco" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.ui.newonKicker, c.eco.title, c.eco.lead)}
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
    .map((p, i) => {
      const first = (p.items || [])[0] || "";
      const rest = (p.items || []).slice(1);
      const n = String(i + 1).padStart(2, "0");
      return `<li class="nls-expand__item">
        <span class="nls-expand__n">${n}</span>
        <div class="nls-expand__body">
          <h4>${escapeHtml(p.title)}</h4>
          ${first ? `<p>${escapeHtml(first)}</p>` : ""}
          ${rest.length ? moreBlock(c.ui.more, list(rest, "nls-points")) : ""}
        </div>
      </li>`;
    })
    .join("");
  return `<div id="nls-revenue" class="nls-block" data-hs-section>
    ${titleBlock(c.ui.expandKicker, c.revenue.title, c.revenue.lead)}
    <p class="nls-note">${escapeHtml(c.ui.revenueNote)}</p>
    <ol class="nls-expand">${cols}</ol>
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
  return `<div id="nls-roadmap" class="nls-block nls-block--band" data-hs-section>
    ${titleBlock(c.ui.roadKicker, c.roadmap.title, "")}
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
  return `<div id="nls-close" class="nls-block nls-close nls-block--ink" data-hs-section>
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
    ${firstMomentsBlock(c, L)}
    ${knowledgeBlock(c)}
    ${learnBlock(c)}
    ${coreBlock(c)}
    ${sitsBlock(c)}
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
