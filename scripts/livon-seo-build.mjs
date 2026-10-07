#!/usr/bin/env node
/**
 * LIVON SEO build — static, crawlable pages generated from the SAME data the app uses.
 *
 *   life-topics.json · life-data.js · life-events-data.js · help-data.js      (single source of truth)
 *        ↓  buildManifest()      which page exists, its URL, title, description, index policy
 *        ↓  renderPage()         complete HTML: no application JavaScript is needed to read it
 *   <out>/livon/life/…  <out>/livon/life-events/…  <out>/livon/help/…  +  sitemap entries  +  seo-manifest.json
 *
 *   node scripts/livon-seo-build.mjs --out _publish            (run by scripts/publish-site.mjs)
 *   LIVON_SEO_INDEX=off …                                      pre-launch: every page noindex, nothing in the sitemap
 *                                                               (also "false", "0", "no"; unset = ON)
 *
 * Rules
 *   - Nothing is written for the pages: every sentence comes from the curated data or the Help articles.
 *   - Only pages with real substance are indexable (see POLICY). The rest stays inside the app.
 *   - Real directories with index.html (GitHub Pages: no rewrites). No inline script except JSON-LD data blocks.
 *   - Deterministic: same sources → byte-identical output. No dates are invented (lastmod only from the data file).
 *   - Reads curated content only: never browser storage, a visitor profile, community posts or the Admin.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import { loadLivon } from "./livon-data-quality.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
export const SITE = "https://www.newon.app";
export const BRAND = "LIVON";
export const OG_IMAGE = SITE + "/assets/livon-mark.jpg";   /* exists in the repository (1024×1024) */
export const CSS_VERSION = "20261002seo1";

/* what may be indexed — checked again by scripts/livon-seo-quality.mjs */
export const POLICY = {
  topic: { featuredOnly: true, minKnowledge: 2, minGuide: 3, minChecklist: 3, minRelations: 2, minText: 250 },
  lifeEvent: { minTopics: 3, minChecklist: 3 },
  thin: { minTextChars: 280, minInternalLinks: 3 }
};

/* why a whole area has no static page (reported in the manifest and in docs/livon/LIVON_SEO.md) */
export const EXCLUDED_AREAS = [
  { area: "my-life", reason: "personal area: a visitor's own data in the browser — nothing public to index" },
  { area: "onboarding", reason: "a personal setup dialog, not content" },
  { area: "personalization", reason: "a visitor's preferences" },
  { area: "community-local", reason: "posts exist only in the writer's browser — never generated, never indexed" },
  { area: "community-curated", reason: "group and challenge names only: too thin for a page" },
  { area: "today", reason: "places and seasonal picks whose hours, prices and dates change: existing redirect stubs stay noindex" },
  { area: "explore", reason: "records are pointers to official sites: a page per record would be thin; the official site is the right result" },
  { area: "search-results", reason: "query and filter states (#ex-results?q=, #cm-home?q=, #help/search?q=) are not pages" },
  { area: "livon-ai", reason: "an interactive tool with no public content" },
  { area: "admin", reason: "local tool, removed from the published site" },
  { area: "data-manager", reason: "local tool, removed from the published site" }
];

/* search intent → the page that answers it (a mapping, not a ranking promise) */
export const INTENTS = [
  ["LIVON", "/livon/"], ["리브온 생애주기 생활 정보", "/livon/"], ["생애주기 정보", "/livon/"], ["라이프 스테이지", "/livon/life/"], ["연령대별 생활 정보", "/livon/life/"],
  ["10대 생활 정보", "/livon/life/10s/"], ["20대 생활 정보", "/livon/life/20s/"], ["30대 생활 정보", "/livon/life/30s/"], ["40대 생활 정보", "/livon/life/40s/"],
  ["50대 생활 정보", "/livon/life/50s/"], ["60대 생활 정보", "/livon/life/60s/"], ["70대 생활 정보", "/livon/life/70s/"],
  ["첫 취업 준비", "/livon/life/20s/first-job/"], ["첫 독립 준비", "/livon/life/20s/first-independence/"], ["월급 관리", "/livon/life/20s/salary-management/"], ["청년 정책", "/livon/life/20s/youth-policy/"],
  ["라이프 이벤트", "/livon/life-events/"], ["Life Event", "/livon/life-events/"], ["첫 취업 Life Event", "/livon/life-events/first-job/"], ["독립 준비", "/livon/life-events/independent/"],
  ["이직 준비", "/livon/life-events/job-change/"], ["창업 준비", "/livon/life-events/startup/"], ["육아 정보", "/livon/life-events/parenting/"], ["출산 준비", "/livon/life-events/childbirth/"],
  ["부모 돌봄", "/livon/life-events/parent-care/"], ["가족 돌봄", "/livon/life-events/family-care/"], ["은퇴 준비", "/livon/life-events/retire-prep/"], ["노후 준비", "/livon/life-events/later-life/"],
  ["건강검진 준비", "/livon/life-events/checkup/"], ["신혼생활 준비", "/livon/life-events/newlywed/"], ["자녀 교육", "/livon/life-events/child-edu/"],
  ["LIVON 도움말", "/livon/help/"], ["회원가입 없이 LIVON", "/livon/help/no-signup/"], ["LIVON 저장 위치", "/livon/help/local-data-storage/"], ["LIVON 다른 기기", "/livon/help/other-device/"],
  ["LIVON 추천 기준", "/livon/help/how-recommendation-works/"], ["LIVON 추천 AI", "/livon/help/recommendation-ai/"], ["LIVON AI 사용", "/livon/help/ai-status/"],
  ["LIVON 커뮤니티 글 저장", "/livon/help/community-post-storage/"], ["LIVON 커뮤니티 신고", "/livon/help/community-report/"], ["LIVON 로그인 계정", "/livon/help/account-status/"],
  ["브라우저 기록 삭제 LIVON", "/livon/help/clear-browser-data/"], ["LIVON 저장이 막혀", "/livon/help/storage-blocked/"], ["LIVON 공식 출처", "/livon/help/official-badge/"]
];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clip = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/[\s,·]+\S*$/, "") + "…"; };
const fillFacts = (s, facts) => String(s ?? "").replace(/\{(\w+)\}/g, (m, k) => (facts[k] != null ? String(facts[k]) : m));
const isHttps = (u) => /^https:\/\/[^\s"'<>]+$/.test(String(u || ""));
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/* ───────── sources ───────── */
export function loadSources() {
  const ctx = loadLivon();
  const help = { window: {} };
  vm.createContext(help);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "livon", "help-data.js"), "utf8"), help, { filename: "help-data.js" });
  const life = ctx.LivonLifeHub.repo.data;
  const repo = ctx.LivonScreenData.repository();
  const J = (x) => JSON.parse(JSON.stringify(x));
  /* Life Event → topics, through the same Data Platform relation the app uses */
  const topicsByEvent = {};
  repo.all().filter((e) => /^topic:/.test(String(e.id))).forEach((e) => (e.lifeEvents || []).forEach((id) => { (topicsByEvent[id] = topicsByEvent[id] || []).push(String(e.id).slice(6)); }));
  const records = {};
  for (const t of life.topics) for (const id of [...(t.relatedContentIds || []), ...(t.relatedClassIds || [])]) {
    const e = repo.getById(/^(ex|td):/.test(id) ? id : "ex:" + id, { any: true });
    if (e && e.title) records[id] = { title: String(e.title), href: String(e.href || "") };
  }
  return {
    updatedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(life.updatedAt)) ? life.updatedAt : null,
    stages: J(life.stages), topics: J(life.topics), categories: J(life.categories), policies: J(life.policies),
    stageCopy: J(ctx.LivonLifeData.stages), events: J(ctx.LivonLifeEvents.events), topicsByEvent: J(topicsByEvent), records,
    help: J(help.window.LivonHelpData)
  };
}

/* ───────── index policy ───────── */
const relationCount = (t) => ["relatedPolicyIds", "relatedServiceIds", "relatedContentIds", "relatedClassIds", "relatedPlaceIds"].reduce((n, k) => n + (t[k] || []).length, 0);
const topicText = (t) => [t.description].concat((t.knowledge || []).map((k) => k.title + k.body), (t.guide || []).map((k) => k.title + k.body), (t.checklist || []).map((k) => k.text)).join("");
export function topicPolicy(t, stage) {
  const P = POLICY.topic, why = [];
  if ((t.knowledge || []).length < P.minKnowledge) why.push("knowledge");
  if ((t.guide || []).length < P.minGuide) why.push("guide");
  if ((t.checklist || []).length < P.minChecklist) why.push("checklist");
  if (relationCount(t) < P.minRelations) why.push("relations");
  if (topicText(t).length < P.minText) why.push("text");
  if (P.featuredOnly && !(stage && (stage.featuredTopicIds || []).includes(t.id))) why.push("not-featured");
  return { index: why.length === 0, why };
}
export function eventPolicy(ev, topicIds) {
  const P = POLICY.lifeEvent, why = [];
  if ((topicIds || []).length < P.minTopics) why.push((topicIds || []).length ? "few-topics" : "no-content");
  if ((ev.checklist || []).length < P.minChecklist) why.push("checklist");
  if (!ev.blurb) why.push("blurb");
  return { index: why.length === 0, why };
}

/* ───────── manifest ───────── */
export function buildManifest(S, opts = {}) {
  const indexing = opts.indexing !== false;
  const pages = [], excluded = [];
  const add = (p) => pages.push(Object.assign({ index: indexing, lastmod: null }, p, { url: SITE + p.path, canonical: SITE + p.path }));
  const stageById = Object.fromEntries(S.stages.map((s) => [s.id, s]));
  const life = [{ name: BRAND, path: "/livon/" }, { name: "라이프 스테이지", path: "/livon/life/" }];

  add({ type: "life-overview", sourceId: "life", slug: "life", path: "/livon/life/", h1: "라이프 스테이지",
    title: `라이프 스테이지: 10대부터 70대 이상까지 | ${BRAND}`,
    description: `10대부터 70대 이상까지 ${S.stages.length}개 연령대별로 그 시기에 필요한 주제, 단계별 가이드, 체크리스트와 공식 정보를 살펴볼 수 있어요.`,
    breadcrumbs: life, lastmod: S.updatedAt });
  for (const s of S.stages) {
    add({ type: "life-stage", sourceId: s.id, slug: s.slug, path: `/livon/life/${s.slug}/`, h1: `${s.label} · ${s.title}`,
      title: `${s.label} 라이프 스테이지: ${s.title} | ${BRAND}`, description: clip(`${s.heroTitle}. ${s.heroLead}`, 155),
      breadcrumbs: life.concat([{ name: s.label, path: `/livon/life/${s.slug}/` }]), lastmod: S.updatedAt });
  }
  for (const t of S.topics) {
    const s = stageById[t.lifeStageId], pol = topicPolicy(t, s);
    if (!pol.index) { excluded.push({ type: "life-topic", sourceId: t.id, reason: pol.why.join(","), where: `/livon/life/${t.stageSlug}/ (listed) · app #life/${t.stageSlug}/${t.slug}` }); continue; }
    add({ type: "life-topic", sourceId: t.id, slug: t.slug, path: `/livon/life/${t.stageSlug}/${t.slug}/`, h1: t.title,
      title: `${t.title} · ${s.label} | ${BRAND}`, description: clip(`${t.description} ${(t.knowledge[0] || {}).body || ""}`, 155),
      breadcrumbs: life.concat([{ name: s.label, path: `/livon/life/${s.slug}/` }, { name: t.title, path: `/livon/life/${t.stageSlug}/${t.slug}/` }]), lastmod: S.updatedAt });
  }
  const ev = [{ name: BRAND, path: "/livon/" }, { name: "Life Event", path: "/livon/life-events/" }];
  add({ type: "life-event-overview", sourceId: "life-events", slug: "life-events", path: "/livon/life-events/", h1: "Life Event",
    title: `Life Event: 삶의 변화에 맞춘 준비 | ${BRAND}`,
    description: "첫 취업, 독립, 육아, 은퇴 준비처럼 삶에서 마주치는 일(라이프 이벤트)을 기준으로 관련 주제와 준비할 것을 모았어요.", breadcrumbs: ev });
  for (const e of S.events) {
    const ids = S.topicsByEvent[e.id] || [], pol = eventPolicy(e, ids);
    if (!pol.index) { excluded.push({ type: "life-event", sourceId: e.id, reason: pol.why.join(","), where: "/livon/life-events/ (listed)" }); continue; }
    const labels = e.stages.map((id) => (stageById[id] || {}).label).filter(Boolean).join("·");
    add({ type: "life-event", sourceId: e.id, slug: e.id, path: `/livon/life-events/${e.id}/`, h1: e.title,
      title: `${e.title} · Life Event | ${BRAND}`, description: clip(`${e.blurb} ${labels}에 해당하는 관련 주제 ${ids.length}개와 준비 체크리스트를 볼 수 있어요.`, 155),
      breadcrumbs: ev.concat([{ name: e.title, path: `/livon/life-events/${e.id}/` }]) });
  }
  const H = S.help, catById = Object.fromEntries(H.categories.map((c) => [c.id, c])), indexable = new Set(H.seoIndexable || []);
  const hp = [{ name: BRAND, path: "/livon/" }, { name: "도움말", path: "/livon/help/" }];
  add({ type: "help-home", sourceId: "help", slug: "help", path: "/livon/help/", h1: `${BRAND} 도움말`, title: `${BRAND} 도움말`,
    description: "LIVON을 회원가입 없이 쓰는 방법, 내 정보가 저장되는 곳, 맞춤 설정과 추천, 커뮤니티, LIVON AI에 대해 자주 묻는 질문과 답이에요.", breadcrumbs: hp });
  for (const a of H.articles) {
    if (!indexable.has(a.id)) { excluded.push({ type: "help-article", sourceId: a.id, reason: "internal-help-only", where: `app #help/a/${a.id}` }); continue; }
    const title = fillFacts(a.title, H.facts);
    /* the short answer is the description; a very short one is completed with the article's own next sentence */
    const more = a.short.length < 50 ? " " + ((a.ts && a.ts.symptom) || (a.body || [])[0] || "") : "";
    add({ type: "help-article", sourceId: a.id, slug: a.id, path: `/livon/help/${a.id}/`, h1: title, title: `${title} | ${BRAND} 도움말`, description: clip(fillFacts(a.short + more, H.facts), 155),
      breadcrumbs: hp.concat([{ name: catById[a.cat].label, path: `/livon/help/#${a.cat}` }, { name: title, path: `/livon/help/${a.id}/` }]) });
  }
  for (const p of pages) if (!p.path.split("/").filter(Boolean).every((seg) => SLUG.test(seg))) throw new Error("unsafe path: " + p.path);
  const seen = new Set();
  for (const p of pages) { if (seen.has(p.path)) throw new Error("duplicate path: " + p.path); seen.add(p.path); }
  return { version: 1, site: SITE, indexing, pages, excluded, excludedAreas: EXCLUDED_AREAS };
}

/* ───────── page shell ───────── */
function jsonLd(obj) { return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`; }
export function structuredData(p, extra) {
  const graph = [
    { "@type": "WebPage", "@id": p.url + "#webpage", url: p.url, name: p.title, description: p.description, inLanguage: "ko", isPartOf: { "@id": SITE + "/livon/#website" } },
    { "@type": "BreadcrumbList", "@id": p.url + "#breadcrumb", itemListElement: p.breadcrumbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, item: SITE + b.path })) }
  ];
  if (extra) graph.push(extra);
  return { "@context": "https://schema.org", "@graph": graph };
}
function shell(p, body, ld) {
  const crumbs = p.breadcrumbs.map((b, i) => (i === p.breadcrumbs.length - 1 ? `<li aria-current="page">${esc(b.name)}</li>` : `<li><a href="${esc(b.path)}">${esc(b.name)}</a></li>`)).join("");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}" />
<meta name="robots" content="${p.index ? "index, follow" : "noindex, follow"}" />
<link rel="canonical" href="${esc(p.canonical)}" />
<meta property="og:type" content="${p.type === "help-article" || p.type === "life-topic" ? "article" : "website"}" />
<meta property="og:site_name" content="${BRAND}" />
<meta property="og:locale" content="ko_KR" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.description)}" />
<meta property="og:url" content="${esc(p.canonical)}" />
<meta property="og:image" content="${OG_IMAGE}" />
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${esc(p.title)}" />
<meta name="twitter:description" content="${esc(p.description)}" />
<meta name="twitter:image" content="${OG_IMAGE}" />
<link rel="icon" href="/assets/livon-mark.jpg" type="image/jpeg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800&amp;display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/livon/seo.css?v=${CSS_VERSION}" />
${jsonLd(ld)}
</head>
<body class="lv-seo">
<a class="lv-seo-skip" href="#main">본문으로 건너뛰기</a>
<header class="lv-seo-top">
<div class="lv-seo-inner lv-seo-top__row">
<a class="lv-seo-brand" href="/livon/">${BRAND}</a>
<nav class="lv-seo-nav" aria-label="LIVON 안내">
<a href="/livon/life/">라이프 스테이지</a>
<a href="/livon/life-events/">Life Event</a>
<a href="/livon/help/">도움말</a>
<a class="lv-seo-nav__app" href="/livon/">LIVON 열기</a>
</nav>
</div>
</header>
<main id="main" class="lv-seo-inner">
<nav class="lv-seo-crumbs" aria-label="현재 위치"><ol>${crumbs}</ol></nav>
${body}
</main>
<footer class="lv-seo-foot">
<div class="lv-seo-inner">
<p>LIVON은 삶의 단계와 상황에 맞는 정보를 한곳에서 찾고 관리하는 서비스예요. 회원가입 없이 쓸 수 있어요.</p>
<nav aria-label="LIVON 바로가기">
<a href="/livon/">LIVON 홈</a>
<a href="/livon/life/">라이프 스테이지</a>
<a href="/livon/life-events/">Life Event</a>
<a href="/livon/help/">도움말</a>
<a href="/ko/">Newon</a>
</nav>
<p class="lv-seo-foot__note">정책과 지원 내용은 바뀔 수 있어요. 신청 전에 공식 사이트에서 확인해 주세요.</p>
</div>
</footer>
</body>
</html>
`;
}
const cta = (href, label, note) => `<p class="lv-seo-cta"><a class="lv-seo-btn" href="${esc(href)}">${esc(label)}</a>${note ? `<span>${esc(note)}</span>` : ""}</p>`;
const ext = (url, label) => `<a href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(label)}<span class="lv-seo-ext"> (공식 사이트, 새 창)</span></a>`;

/* ───────── renderers ───────── */
export function renderPages(S, manifest) {
  const byPath = Object.fromEntries(manifest.pages.map((p) => [p.path, p]));
  const stageById = Object.fromEntries(S.stages.map((s) => [s.id, s]));
  const copyById = Object.fromEntries(S.stageCopy.map((s) => [String(s.id), s]));
  const topicById = Object.fromEntries(S.topics.map((t) => [t.id, t]));
  const policyById = Object.fromEntries(S.policies.map((p) => [p.id, p]));
  const eventById = Object.fromEntries(S.events.map((e) => [e.id, e]));
  const H = S.help, F = H.facts, catById = Object.fromEntries(H.categories.map((c) => [c.id, c])), helpById = Object.fromEntries(H.articles.map((a) => [a.id, a]));
  /* a topic links to its static page when it has one, otherwise into the app */
  const topicHref = (t) => (byPath[`/livon/life/${t.stageSlug}/${t.slug}/`] ? `/livon/life/${t.stageSlug}/${t.slug}/` : `/livon/#life/${t.stageSlug}/${t.slug}`);
  const eventHref = (id) => (byPath[`/livon/life-events/${id}/`] ? `/livon/life-events/${id}/` : null);
  const helpHref = (id) => (byPath[`/livon/help/${id}/`] ? `/livon/help/${id}/` : `/livon/#help/a/${id}`);
  const topicItem = (t, withStage) => `<li><a href="${esc(topicHref(t))}">${esc(t.title)}</a>${withStage ? ` <small>${esc(stageById[t.lifeStageId].label)}</small>` : ""}<p>${esc(t.description)}</p></li>`;
  const policyItem = (p) => `<li><strong>${esc(p.name)}</strong> <small>${esc(p.provider)}</small><p>${esc(p.summary)}</p><p>${isHttps(p.sourceUrl) ? ext(p.sourceUrl, p.name) : ""}${p.checkedAt ? ` <small>확인일 ${esc(p.checkedAt)}</small>` : ""}</p></li>`;
  const out = [];
  const emit = (p, body, extra) => out.push({ path: p.path, html: shell(p, body, structuredData(p, extra)) });

  for (const p of manifest.pages) {
    if (p.type === "life-overview") {
      emit(p, `<header class="lv-seo-head"><p class="lv-seo-eyebrow">Life Stage</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(p.description)}</p></header>
<section aria-labelledby="stages"><h2 id="stages">연령대별로 보기</h2><ul class="lv-seo-cards">${S.stages.map((s) => `<li><a href="/livon/life/${s.slug}/"><strong>${esc(s.label)} · ${esc(s.title)}</strong><span>${esc(s.heroTitle)}</span><small>주제 ${S.topics.filter((t) => t.lifeStageId === s.id).length}개</small></a></li>`).join("")}</ul></section>
<section aria-labelledby="more"><h2 id="more">함께 보기</h2><ul class="lv-seo-links"><li><a href="/livon/life-events/">Life Event: 삶의 변화에 맞춘 준비</a></li><li><a href="${helpHref("what-is-life-stage")}">라이프 스테이지가 무엇인가요?</a></li><li><a href="${helpHref("other-life-stages")}">다른 연령대 정보도 볼 수 있나요?</a></li></ul></section>
${cta("/livon/#life", "LIVON에서 라이프 스테이지 보기", "회원가입 없이 바로 볼 수 있어요.")}`);
    } else if (p.type === "life-stage") {
      const s = stageById[p.sourceId], copy = copyById[s.id] || {}, topics = S.topics.filter((t) => t.lifeStageId === s.id);
      const featured = (s.featuredTopicIds || []).map((id) => topicById[id]).filter(Boolean);
      const cats = S.categories.filter((c) => c.stageId === s.id).map((c) => ({ c, list: (c.topicIds || []).map((id) => topicById[id]).filter(Boolean) })).filter((x) => x.list.length);
      const events = S.events.filter((e) => (e.stages || []).includes(s.id));
      const pols = [...new Set(topics.flatMap((t) => t.relatedPolicyIds || []))].map((id) => policyById[id]).filter(Boolean);
      const others = S.stages.filter((x) => x.id !== s.id);
      emit(p, `<header class="lv-seo-head"><p class="lv-seo-eyebrow">Life Stage · ${esc(s.label)}</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(s.heroTitle)}. ${esc(s.heroLead)}</p>${copy.lead ? `<p>${esc(copy.lead)}</p>` : ""}</header>
<section aria-labelledby="featured"><h2 id="featured">${esc(s.label)}에 먼저 살펴볼 주제</h2><ul class="lv-seo-topics">${featured.map((t) => topicItem(t)).join("")}</ul></section>
<section aria-labelledby="all"><h2 id="all">분야별 주제 ${topics.length}개</h2>${cats.map((x) => `<h3>${esc(x.c.name)}</h3><ul class="lv-seo-inline">${x.list.map((t) => `<li><a href="${esc(topicHref(t))}">${esc(t.title)}</a></li>`).join("")}</ul>`).join("")}</section>
${events.length ? `<section aria-labelledby="events"><h2 id="events">${esc(s.label)}의 Life Event</h2><ul class="lv-seo-inline">${events.map((e) => (eventHref(e.id) ? `<li><a href="${eventHref(e.id)}">${esc(e.title)}</a></li>` : `<li>${esc(e.title)}</li>`)).join("")}</ul><p><a href="/livon/life-events/">Life Event 전체 보기</a></p></section>` : ""}
${pols.length ? `<section aria-labelledby="official"><h2 id="official">함께 확인할 공식 정보</h2><ul class="lv-seo-official">${pols.map(policyItem).join("")}</ul></section>` : ""}
<section aria-labelledby="other"><h2 id="other">다른 연령대</h2><ul class="lv-seo-inline">${others.map((x) => `<li><a href="/livon/life/${x.slug}/">${esc(x.label)}</a></li>`).join("")}</ul></section>
${cta(`/livon/#life/${s.slug}`, `LIVON에서 ${s.label} 정보 보기`, "체크리스트 진행과 저장은 LIVON 안에서 할 수 있어요.")}`);
    } else if (p.type === "life-topic") {
      const t = topicById[p.sourceId], s = stageById[t.lifeStageId];
      const pols = (t.relatedPolicyIds || []).map((id) => policyById[id]).filter(Boolean);
      const recs = [...(t.relatedContentIds || []), ...(t.relatedClassIds || [])].map((id) => S.records[id]).filter((r) => r && /^#[\w\-./]+$/.test(r.href));
      const rel = (t.relatedTopicIds || []).map((id) => topicById[id]).filter(Boolean);
      const events = S.events.filter((e) => (S.topicsByEvent[e.id] || []).includes(t.id));
      emit(p, `<article><header class="lv-seo-head"><p class="lv-seo-eyebrow">${esc(s.label)} · ${esc(t.category)}</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(t.description)}</p></header>
<section aria-labelledby="know"><h2 id="know">알아 둘 점</h2><dl class="lv-seo-dl">${t.knowledge.map((k) => `<dt>${esc(k.title)}</dt><dd>${esc(k.body)}</dd>`).join("")}</dl></section>
<section aria-labelledby="guide"><h2 id="guide">단계별 가이드</h2><ol class="lv-seo-steps">${t.guide.map((g) => `<li><strong>${esc(g.title)}</strong> ${esc(g.body)}</li>`).join("")}</ol></section>
<section aria-labelledby="check"><h2 id="check">체크리스트</h2><ul class="lv-seo-check">${t.checklist.map((c) => `<li>${esc(c.text)}</li>`).join("")}</ul></section>
${pols.length ? `<section aria-labelledby="official"><h2 id="official">공식 정보</h2><ul class="lv-seo-official">${pols.map(policyItem).join("")}</ul></section>` : ""}
${recs.length ? `<section aria-labelledby="explore"><h2 id="explore">LIVON 탐색에서 이어 보기</h2><ul class="lv-seo-links">${recs.map((r) => `<li><a href="/livon/${esc(r.href)}">${esc(r.title)}</a></li>`).join("")}</ul></section>` : ""}
</article>
${rel.length ? `<section aria-labelledby="related"><h2 id="related">관련 주제</h2><ul class="lv-seo-topics">${rel.map((x) => topicItem(x, x.lifeStageId !== t.lifeStageId)).join("")}</ul></section>` : ""}
${events.some((e) => eventHref(e.id)) ? `<section aria-labelledby="events"><h2 id="events">관련 Life Event</h2><ul class="lv-seo-inline">${events.filter((e) => eventHref(e.id)).map((e) => `<li><a href="${eventHref(e.id)}">${esc(e.title)}</a></li>`).join("")}</ul></section>` : ""}
${cta(`/livon/#life/${t.stageSlug}/${t.slug}`, "LIVON에서 이 주제 보기", "체크리스트를 표시하고 내 생활의 할 일로 보낼 수 있어요.")}`);
    } else if (p.type === "life-event-overview") {
      const withPage = S.events.filter((e) => eventHref(e.id)), few = S.events.filter((e) => !eventHref(e.id) && (S.topicsByEvent[e.id] || []).length), none = S.events.filter((e) => !(S.topicsByEvent[e.id] || []).length);
      emit(p, `<header class="lv-seo-head"><p class="lv-seo-eyebrow">Life Event</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(p.description)}</p></header>
<section aria-labelledby="list"><h2 id="list">Life Event별로 보기</h2><ul class="lv-seo-cards">${withPage.map((e) => `<li><a href="${eventHref(e.id)}"><strong>${esc(e.title)}</strong><span>${esc(e.blurb)}</span><small>${esc(e.stages.map((id) => stageById[id].label).join(" · "))} · 관련 주제 ${(S.topicsByEvent[e.id] || []).length}개</small></a></li>`).join("")}</ul></section>
${few.length ? `<section aria-labelledby="few"><h2 id="few">LIVON 안에서 볼 수 있는 Life Event</h2><p>아래 항목은 관련 주제가 아직 많지 않아 LIVON 안에서 안내해요.</p><ul class="lv-seo-inline">${few.map((e) => `<li>${esc(e.title)}</li>`).join("")}</ul></section>` : ""}
${none.length ? `<section aria-labelledby="none"><h2 id="none">안내를 준비 중인 Life Event</h2><p>현재 연결된 안내가 충분하지 않아요.</p><ul class="lv-seo-inline">${none.map((e) => `<li>${esc(e.title)}</li>`).join("")}</ul></section>` : ""}
<section aria-labelledby="more"><h2 id="more">함께 보기</h2><ul class="lv-seo-links"><li><a href="/livon/life/">라이프 스테이지</a></li><li><a href="${helpHref("what-is-life-event")}">Life Event가 무엇인가요?</a></li></ul></section>
${cta("/livon/#life-events", "LIVON에서 Life Event 보기", "")}`);
    } else if (p.type === "life-event") {
      const e = eventById[p.sourceId], ids = S.topicsByEvent[e.id] || [];
      const groups = S.stages.map((s) => ({ s, list: ids.map((id) => topicById[id]).filter((t) => t && t.lifeStageId === s.id) })).filter((g) => g.list.length);
      const others = S.events.filter((x) => x.id !== e.id && eventHref(x.id) && x.stages.some((st) => e.stages.includes(st))).slice(0, 8);
      emit(p, `<header class="lv-seo-head"><p class="lv-seo-eyebrow">Life Event · ${esc(e.stages.map((id) => stageById[id].label).join(" · "))}</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(e.blurb)}</p></header>
<section aria-labelledby="check"><h2 id="check">준비할 것</h2><ul class="lv-seo-check">${e.checklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>${(e.needs || []).length ? `<p>함께 살펴볼 것: ${esc(e.needs.join(", "))}</p>` : ""}</section>
<section aria-labelledby="topics"><h2 id="topics">연령대별 관련 주제</h2>${groups.map((g) => `<h3><a href="/livon/life/${g.s.slug}/">${esc(g.s.label)}</a></h3><ul class="lv-seo-topics">${g.list.map((t) => topicItem(t)).join("")}</ul>`).join("")}</section>
${others.length ? `<section aria-labelledby="other"><h2 id="other">함께 보는 Life Event</h2><ul class="lv-seo-inline">${others.map((x) => `<li><a href="${eventHref(x.id)}">${esc(x.title)}</a></li>`).join("")}</ul></section>` : ""}
${cta("/livon/#life-events", "LIVON에서 관련 정보 확인", "맞춤 설정에서 이 Life Event를 고르면 관련 정보를 먼저 보여 줘요.")}`);
    } else if (p.type === "help-home") {
      const cats = H.categories.map((c) => ({ c, list: H.articles.filter((a) => a.cat === c.id && byPath[`/livon/help/${a.id}/`]) })).filter((x) => x.list.length);
      const qa = cats.flatMap((x) => x.list);
      emit(p, `<header class="lv-seo-head"><p class="lv-seo-eyebrow">Help</p><h1>${esc(p.h1)}</h1><p class="lv-seo-lead">${esc(p.description)}</p></header>
${cats.map((x) => `<section aria-labelledby="${x.c.id}"><h2 id="${x.c.id}">${esc(x.c.label)}</h2><dl class="lv-seo-faq">${x.list.map((a) => `<dt><a href="/livon/help/${a.id}/">${esc(fillFacts(a.title, F))}</a></dt><dd>${esc(fillFacts(a.short, F))}</dd>`).join("")}</dl></section>`).join("")}
${cta("/livon/#help", "LIVON 도움말 전체 보기", "검색, 문제 해결, 서비스 상태는 LIVON 안의 도움말에 있어요.")}`,
        { "@type": "FAQPage", "@id": p.url + "#faq", mainEntity: qa.map((a) => ({ "@type": "Question", name: fillFacts(a.title, F), acceptedAnswer: { "@type": "Answer", text: fillFacts(a.short, F) } })) });
    } else if (p.type === "help-article") {
      const a = helpById[p.sourceId], c = catById[a.cat], ts = a.ts, f = (s) => esc(fillFacts(s, F));
      const list = (title, items, tag) => (items && items.length ? `<section><h2>${title}</h2><${tag}>${items.map((x) => `<li>${f(x)}</li>`).join("")}</${tag}></section>` : "");
      const related = (a.related || []).map((id) => helpById[id]).filter(Boolean);
      emit(p, `<article><header class="lv-seo-head"><p class="lv-seo-eyebrow">도움말 · ${esc(c.label)}</p><h1>${esc(p.h1)}</h1><p class="lv-seo-answer">${f(a.short)}</p></header>
${ts ? `<section><h2>증상</h2><p>${f(ts.symptom)}</p></section>${list("가능한 이유", ts.causes, "ul")}${list("해결 방법", ts.fixes, "ol")}` : ""}
${(a.body || []).map((x) => `<p>${f(x)}</p>`).join("")}
${list("이렇게 해 보세요", a.steps, "ol")}
${a.note ? `<p class="lv-seo-note"><strong>알아 두세요</strong> ${f(a.note)}</p>` : ""}
</article>
${related.length ? `<section aria-labelledby="related"><h2 id="related">관련 도움말</h2><ul class="lv-seo-links">${related.map((r) => `<li><a href="${esc(helpHref(r.id))}">${f(r.title)}</a></li>`).join("")}</ul></section>` : ""}
${cta(`/livon/#help/a/${a.id}`, "LIVON 도움말에서 보기", "")}
${a.feature && /^#[\w\-/?=&]+$/.test(a.feature[1]) ? `<p class="lv-seo-cta lv-seo-cta--sub"><a href="/livon/${esc(a.feature[1])}">${esc(a.feature[0])} 열기</a></p>` : ""}`);
    }
  }
  return out;
}

/* ───────── sitemap ───────── */
export function sitemapEntries(manifest) {
  return manifest.pages.filter((p) => p.index).map((p) => ({ loc: p.url, lastmod: p.lastmod }))
    .concat(manifest.indexing ? [{ loc: SITE + "/livon/", lastmod: null }] : []).sort((a, b) => (a.loc < b.loc ? -1 : 1));
}
const MARK_A = "  <!-- LIVON SEO: generated by scripts/livon-seo-build.mjs -->", MARK_B = "  <!-- /LIVON SEO -->";
export function patchSitemap(xml, manifest) {
  const a = xml.indexOf(MARK_A), b = xml.indexOf(MARK_B);
  if (a >= 0 && b > a) xml = xml.slice(0, a).replace(/\s*$/, "\n") + xml.slice(b + MARK_B.length).replace(/^\s*/, "");
  const entries = sitemapEntries(manifest);
  if (!entries.length) return xml;
  const block = MARK_A + "\n" + entries.map((e) => `  <url>\n    <loc>${esc(e.loc)}</loc>\n${e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>\n` : ""}  </url>`).join("\n") + "\n" + MARK_B + "\n";
  const end = xml.lastIndexOf("</urlset>");
  if (end < 0) throw new Error("sitemap.xml: </urlset> not found");
  return xml.slice(0, end).replace(/\s*$/, "\n") + block + xml.slice(end);
}
/* the app page itself: only its robots meta follows the switch (its other metadata is in the source file) */
export function applyIndexingToApp(html, indexing) {
  return html.replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${indexing ? "index, follow" : "noindex, nofollow"}" />`);
}

function main() {
  const i = process.argv.indexOf("--out");
  const out = path.resolve(ROOT, i > 0 ? process.argv[i + 1] : "_publish");
  /* unset → ON (launch default). "off", "false", "0", "no" (any case, surrounding spaces ignored) → closed, so a
     repository variable written as "false" or " off" can never open LIVON by accident. */
  const indexing = !/^(off|false|0|no)$/.test(String(process.env.LIVON_SEO_INDEX || "on").trim().toLowerCase());
  const S = loadSources();
  const manifest = buildManifest(S, { indexing });
  const pages = renderPages(S, manifest);
  for (const pg of pages) {
    const dir = path.join(out, ...pg.path.split("/").filter(Boolean));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), pg.html);
  }
  fs.writeFileSync(path.join(out, "livon", "seo-manifest.json"), JSON.stringify(manifest, null, 1) + "\n");
  const app = path.join(out, "livon", "index.html");
  if (fs.existsSync(app)) fs.writeFileSync(app, applyIndexingToApp(fs.readFileSync(app, "utf8"), indexing));
  const sm = path.join(out, "sitemap.xml");
  if (fs.existsSync(sm)) fs.writeFileSync(sm, patchSitemap(fs.readFileSync(sm, "utf8"), manifest));
  const n = (t) => manifest.pages.filter((p) => p.type === t).length;
  console.log(`livon-seo-build: ${pages.length} pages (stages ${n("life-stage")}, topics ${n("life-topic")}, life events ${n("life-event")}, help ${n("help-article")}) · indexing ${indexing ? "ON" : "OFF"} · excluded ${manifest.excluded.length} → ${path.relative(ROOT, out)}/livon/`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
