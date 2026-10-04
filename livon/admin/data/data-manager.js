/*
 * LIVON Data Manager — UI (local only, READ-ONLY).
 * 1. Refuses to run unless the page is served from localhost / 127.0.0.1 / ::1 / *.localhost / *.test.
 * 2. Loads the same data scripts the LIVON site loads, builds one model (LivonDataManager.createModel) and renders views.
 * 3. Never writes to curated data. Review marks live in localStorage (memory fallback when storage is blocked).
 */
(function () {
  "use strict";
  var DM = window.LivonDataManager;
  var app = document.getElementById("dm-app");

  /* ───────── guard ───────── */
  if (!DM || !DM.isAllowedHost(location.hostname)) {
    document.title = "Unavailable";
    app.setAttribute("data-dm-state", "unavailable");
    app.innerHTML = '<main class="dm-unavailable"><h1>Unavailable</h1><p>This page is not available.</p></main>';
    return;
  }

  var SCRIPTS = DM.DATA_SCRIPTS;
  var VIEWS = [
    ["dashboard", "Dashboard"], ["explorer", "Content Explorer"], ["quality", "Quality Review"], ["queue", "Review Queue"], ["duplicates", "Duplicates"],
    ["relations", "Relations"], ["gaps", "Content Gaps"], ["sources", "Sources"], ["unsourced", "Unsourced / Conflicts"], ["dates", "Date Review"],
    ["freshness", "Freshness"], ["search", "Search Tester"], ["search-set", "66 Search Queries"], ["recommend", "Recommendation Tester"],
    ["taxonomy", "Taxonomy"], ["cta", "CTA"], ["coverage", "Screen Coverage"], ["export", "Export"]
  ];
  var MANUAL_FLAGS = ["UNSOURCED_SPECIFIC", "FIELD_CONFLICT", "DATE_VERIFICATION_REQUIRED", "MISSING_RELATION", "DUPLICATE_CANDIDATE"];

  var model = null, store = null, lastFocus = null;
  var state = { view: "dashboard", q: "", filters: {}, sort: "id", dir: "asc", page: 1, pageSize: 50, queueP: "", datesKind: "", topicStage: "", coverage: "", searchQ: "", rec: { age: "", lifeStage: "", lifeEvent: "", interests: "" } };

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function num(n) { return '<td class="num">' + esc(n) + "</td>"; }
  function badge(t, kind) { return '<span class="dm-badge' + (kind ? " dm-badge--" + kind : "") + '">' + esc(t) + "</span>"; }
  function flagKind(f) { return /BROKEN|INVALID|MISSING_SOURCE|MISSING_SUMMARY|ORPHAN/.test(f) ? "bad" : /UNSOURCED|CONFLICT|DATE|STALE|TIME/.test(f) ? "warn" : f === "MISSING_RELATION" ? "gap" : ""; }
  function flagsHtml(r) { return '<span class="dm-flags">' + r.flags.map(function (f) { var gap = f === "MISSING_RELATION" && model.gapEvents.indexOf(r.id) >= 0; return badge(gap ? "CONTENT GAP" : f, gap ? "gap" : flagKind(f)); }).join("") + "</span>"; }
  function gradeBadge(g) { return badge(g, g === "Excellent" || g === "Good" ? "ok" : g === "Poor" ? "bad" : "warn"); }
  function openBtn(id, label) { return '<button type="button" class="dm-btn--link" data-dm-open="' + esc(id) + '">' + esc(label || id) + "</button>"; }
  function kvCard(title, obj, opts) {
    opts = opts || {};
    var keys = Object.keys(obj); if (opts.sort) keys.sort(function (a, b) { return obj[b] - obj[a]; });
    if (opts.limit) keys = keys.slice(0, opts.limit);
    return '<section class="dm-card" aria-label="' + esc(title) + '"><h2>' + esc(title) + '</h2><dl class="dm-kv">' + keys.map(function (k) { return "<dt>" + esc(k) + "</dt><dd>" + esc(obj[k]) + "</dd>"; }).join("") + "</dl>" + (opts.extra || "") + "</section>";
  }
  function table(caption, head, rows, opts) {
    opts = opts || {};
    return '<div class="dm-scroll" role="region" tabindex="0" aria-label="' + esc(caption) + '"><table class="dm-table"><caption>' + esc(caption) + "</caption><thead><tr>" +
      head.map(function (h) { var n = /^#|count|score|records|official|missing|topics|policy|program|service|place|guide|topic$/i.test(h); return '<th scope="col"' + (n ? ' class="num"' : "") + ">" + esc(h) + "</th>"; }).join("") +
      "</tr></thead><tbody>" + (rows.length ? rows.join("") : '<tr><td colspan="' + head.length + '">' + esc(opts.empty || "None") + "</td></tr>") + "</tbody></table></div>";
  }
  function goExplorer(filters) { state.filters = filters; state.q = ""; state.page = 1; location.hash = "#explorer"; if (state.view === "explorer") render(); }

  /* ───────── storage (review marks only) ───────── */
  function safeStorage() { try { var s = window.localStorage; var k = "__dm_probe__"; s.setItem(k, "1"); s.removeItem(k); return s; } catch (e) { return null; } }

  /* ───────── views ───────── */
  var V = {};
  V.dashboard = function () {
    var d = DM.dashboard(model);
    var total = '<section class="dm-card" aria-label="Total records"><h2>Total records</h2><div class="dm-big" data-dm-total>' + d.total + '</div><p class="dm-note">curated ' + model.report.totals.curated + " · computed from the Data Platform at load</p></section>";
    var q = d.quality;
    var quality = kvCard("Quality (data completeness QA)", { Excellent: q.grades.Excellent, Good: q.grades.Good, "Needs Review": q.grades["Needs Review"], Poor: q.grades.Poor, "Average score": q.average });
    return '<div class="dm-callout">Quality score = <strong>data-completeness QA for editors</strong>. It is never shown to LIVON users and says nothing about the quality of a place, service or policy.</div>' +
      '<div class="dm-grid">' + total + quality +
      kvCard("Flags", d.flags, { sort: true }) +
      kvCard("Sources", d.sources) +
      kvCard("Dates", { "date verification required": d.dates.dateVerificationRequired, "stale review required": d.dates.staleReviewRequired, expired: d.dates.expired, "undated time-sensitive": d.dates.undatedTimeSensitive }) +
      kvCard("Relations", { related: d.relations.related, "missing relation (error)": d.relations.missingRelation, "content gap": d.relations.contentGap, orphan: d.relations.orphan, "broken relation": d.relations.broken }) +
      kvCard("Types", d.types, { sort: true }) +
      kvCard("Age groups", d.ageGroups) +
      kvCard("Life Stages", d.lifeStages) +
      kvCard("Life Events (tagged records)", d.lifeEvents, { sort: true }) +
      kvCard("Source names (top 15)", d.sourceNames, { sort: true, limit: 15 }) +
      kvCard("Categories (top 20)", d.categories, { sort: true, limit: 20, extra: '<p class="dm-note">' + Object.keys(d.categories).length + ' categories — see Taxonomy</p>' }) +
      "</div>";
  };

  function selectField(name, label, options, value) {
    var id = "dm-f-" + name;
    return '<div class="dm-field"><label for="' + id + '">' + esc(label) + '</label><select id="' + id + '" data-dm-filter="' + name + '"><option value="">All</option>' +
      options.map(function (o) { var v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o; return '<option value="' + esc(v) + '"' + (String(value) === String(v) ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("") + "</select></div>";
  }
  V.explorer = function () {
    var F = DM.facets(model), f = state.filters;
    var res = DM.query(model, { q: state.q, filters: f, sort: state.sort, dir: state.dir, page: state.page, pageSize: state.pageSize });
    var yn = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    var controls = '<form class="dm-toolbar" data-dm-explorer role="search" onsubmit="return false">' +
      '<div class="dm-field dm-field--grow"><label for="dm-q">Search records</label><input id="dm-q" type="search" data-dm-q value="' + esc(state.q) + '" placeholder="id, title, summary, tag, source…" autocomplete="off"></div>' +
      selectField("type", "Type", F.type, f.type) + selectField("category", "Category", F.category, f.category) + selectField("age", "Age", F.age.map(function (a) { return { value: a, label: a === "general" ? "general (all ages)" : a + "s" }; }), f.age) +
      selectField("lifeStage", "Life Stage", F.lifeStage.map(function (s) { return { value: s, label: s + "대" }; }), f.lifeStage) + selectField("lifeEvent", "Life Event", F.lifeEvent, f.lifeEvent) +
      selectField("sourceClass", "Source", F.sourceClass, f.sourceClass) + selectField("sourceType", "Source type", F.sourceType, f.sourceType) + selectField("grade", "Quality level", F.grade, f.grade) +
      selectField("flag", "Quality flag", F.flag, f.flag) + selectField("priority", "Priority", F.priority, f.priority) + selectField("dateVerification", "Date verification", yn, f.dateVerification) +
      selectField("hasRelations", "Has relations", yn, f.hasRelations) + selectField("hasOfficialUrl", "Has official URL", yn, f.hasOfficialUrl) + selectField("freshness", "Freshness", F.freshness, f.freshness) +
      selectField("screen", "Screen", F.screen, f.screen) +
      '<div class="dm-field"><label for="dm-sort">Sort</label><select id="dm-sort" data-dm-sort>' + [["id", "ID"], ["title", "Title"], ["type", "Type"], ["score", "Score"], ["updated", "Updated"], ["flags", "Flag count"]].map(function (o) { return '<option value="' + o[0] + '"' + (state.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="dm-field"><label for="dm-dir">Order</label><select id="dm-dir" data-dm-dir><option value="asc"' + (state.dir === "asc" ? " selected" : "") + '>Ascending</option><option value="desc"' + (state.dir === "desc" ? " selected" : "") + ">Descending</option></select></div>" +
      '<button type="button" class="dm-btn dm-btn--ghost" data-dm-reset>Reset</button></form>';
    var rows = res.items.map(function (r) {
      return "<tr><td><code>" + openBtn(r.id) + "</code></td><td>" + esc(r.type) + '</td><td class="dm-cell-title">' + esc(r.title) + "</td><td>" + esc(r.category || "") + "</td><td>" + esc(r.general ? "general" : r.ageGroup.join(",")) +
        "</td><td>" + esc(r.lifeStage.join(",")) + "</td><td>" + esc(r.lifeEvent.join(", ")) + "</td><td>" + esc(r.sourceClass + " · " + (r.sourceName || "")) + '</td><td class="num">' + r.score + "</td><td>" + flagsHtml(r) + "</td><td>" + esc(store.record(r.id) || "") + "</td></tr>";
    });
    var pager = '<nav class="dm-pager" aria-label="Pages"><span data-dm-count>' + res.total + " records</span><button type=\"button\" class=\"dm-btn dm-btn--ghost\" data-dm-page=\"" + (res.page - 1) + '"' + (res.page <= 1 ? " disabled" : "") + '>Previous</button><span>Page ' + res.page + " / " + res.pages +
      '</span><button type="button" class="dm-btn dm-btn--ghost" data-dm-page="' + (res.page + 1) + '"' + (res.page >= res.pages ? " disabled" : "") + '>Next</button><button type="button" class="dm-btn dm-btn--ghost" data-dm-export="filtered-json">Export filtered JSON</button><button type="button" class="dm-btn dm-btn--ghost" data-dm-export="filtered-csv">Export filtered CSV</button></nav>';
    return controls + pager + table("Records (" + res.total + ")", ["ID", "Type", "Title", "Category", "Age", "Life Stage", "Life Event", "Source", "Score", "Flags", "Review"], rows, { empty: "No record matches these filters." }) + pager.replace('aria-label="Pages"', 'aria-label="Pages, below the table"').replace(" data-dm-count", "");
  };

  V.quality = function () {
    var d = DM.dashboard(model), flagDesc = model.env.LivonContentQuality.FLAGS;
    var grades = DM.dashboard(model).quality.grades;
    var gradeBtns = '<div class="dm-toolbar" role="group" aria-label="Quality level">' + Object.keys(grades).map(function (g) { return '<button type="button" class="dm-btn dm-btn--ghost" data-dm-goto=\'' + esc(JSON.stringify({ grade: g })) + "'>" + esc(g) + " · " + grades[g] + "</button>"; }).join("") + "</div>";
    var rows = Object.keys(flagDesc).map(function (f) {
      var n = d.flags[f] || 0, manual = MANUAL_FLAGS.indexOf(f) >= 0;
      return "<tr" + (manual && n ? ' class="dm-hl"' : "") + "><td>" + badge(f, flagKind(f)) + (manual ? " " + badge("manual review", "warn") : "") + "</td><td>" + esc(flagDesc[f]) + "</td>" + num(n) +
        "<td>" + (n ? '<button type="button" class="dm-btn dm-btn--ghost" data-dm-goto=\'' + esc(JSON.stringify({ flag: f })) + "'>Show " + n + "</button>" : "") + "</td></tr>";
    });
    return '<div class="dm-callout dm-callout--warn">This score is <strong>data-completeness QA</strong>, not a user-facing rating. Grades: 90–100 Excellent · 75–89 Good · 60–74 Needs Review · &lt;60 Poor.</div>' +
      gradeBtns + table("Quality flags", ["Flag", "Meaning", "Records", ""], rows);
  };

  V.queue = function () {
    var Q = DM.reviewQueue(model);
    var counts = '<div class="dm-grid">' + DM.PRIORITY_RULES.map(function (r) { return '<section class="dm-card"><h2>' + r.p + " · " + esc(r.label) + '</h2><div class="dm-big" data-dm-p="' + r.p + '">' + Q.counts[r.p] + "</div></section>"; }).join("") + "</div>";
    var rules = table("Deterministic priority rules", ["Priority", "Rule", "Items"], Object.keys(Q.byRule).map(function (k) { var p = k.split(" "); return "<tr><td>" + p[0] + "</td><td>" + badge(p[1], p[1] === "CONTENT_GAP" ? "gap" : flagKind(p[1])) + "</td>" + num(Q.byRule[k]) + "</tr>"; }));
    var items = Q.items.filter(function (i) { return !state.queueP || i.priority === state.queueP; });
    var shown = items.slice(0, 300);
    var filter = '<div class="dm-toolbar"><div class="dm-field"><label for="dm-qp">Priority</label><select id="dm-qp" data-dm-queue><option value="">All</option>' + ["P0", "P1", "P2", "P3", "P4"].map(function (p) { return '<option value="' + p + '"' + (state.queueP === p ? " selected" : "") + ">" + p + " (" + Q.counts[p] + ")</option>"; }).join("") + "</select></div></div>";
    var rows = shown.map(function (i) {
      var mark = i.recordId ? '<label class="dm-sr" for="dm-m-' + esc(i.recordId + i.rule) + '">Review mark for ' + esc(i.recordId) + '</label><select id="dm-m-' + esc(i.recordId + i.rule) + '" data-dm-mark="' + esc(i.recordId) + '"><option value="">—</option><option value="reviewed"' + (store.record(i.recordId) === "reviewed" ? " selected" : "") + '>reviewed</option><option value="needs-review"' + (store.record(i.recordId) === "needs-review" ? " selected" : "") + ">needs review</option></select>" : "";
      return "<tr><td>" + i.priority + "</td><td>" + badge(i.rule, i.rule === "CONTENT_GAP" ? "gap" : flagKind(i.rule)) + "</td><td>" + (i.recordId ? "<code>" + openBtn(i.recordId) + "</code>" : "—") + "</td><td>" + esc(i.title) + "</td><td>" + esc(i.note) + "</td><td>" + mark + "</td></tr>";
    });
    return '<p class="dm-note">Only what a person has to look at. P0 = broken/invalid (blocking), P1 = unsourced or conflicting factual claim, P2 = dates, P3 = missing relation / content gap, P4 = duplicates, taxonomy and CTA cleanup.</p>' +
      counts + rules + '<div class="dm-section">' + filter + table("Queue items (" + items.length + (items.length > shown.length ? ", first " + shown.length + " shown" : "") + ")", ["P", "Rule", "Record", "Title", "Note", "Mark"], rows, { empty: "Queue is empty." }) + "</div>";
  };

  V.duplicates = function () {
    var G = DM.duplicateGroups(model);
    var n = G.reduce(function (s, g) { return s + g.members.length; }, 0);
    return '<p class="dm-note">' + G.length + " groups · " + n + " memberships (" + (DM.dashboard(model).flags.DUPLICATE_CANDIDATE || 0) + " records flagged). Nothing is merged or deleted; KEEP / REVIEW is a local review mark only.</p>" +
      G.map(function (g, i) {
        var cur = store.group(g.key);
        var rows = g.members.map(function (x) { return "<tr><td><code>" + openBtn(x.id) + "</code></td><td>" + esc(x.title) + "</td><td>" + esc(x.type) + "</td><td>" + esc(x.age) + "</td><td>" + esc(x.category || "") + '</td><td class="dm-mono">' + esc(x.url || "") + "</td></tr>"; });
        return '<section class="dm-section" aria-labelledby="dm-dup-' + i + '"><h2 id="dm-dup-' + i + '">' + esc(g.basis) + ": " + esc(g.value) + "</h2>" +
          '<p class="dm-note">Similarity basis: <strong>' + esc(g.basis) + "</strong> · reason kept: " + badge(g.reasonCode) + " " + esc(g.reason.replace(/^[A-Z_]+ — /, "")) + "</p>" +
          '<div class="dm-toolbar" role="group" aria-label="Local review mark">' + ["keep", "review"].map(function (v) { return '<button type="button" class="dm-btn dm-btn--ghost" aria-pressed="' + (cur === v) + '" data-dm-group="' + esc(g.key) + '" data-dm-value="' + v + '">' + v.toUpperCase() + "</button>"; }).join("") + "</div>" +
          table("Members", ["ID", "Title", "Type", "Age", "Category", "URL"], rows) + "</section>";
      }).join("");
  };

  V.relations = function () {
    var R = DM.relationExplorer(model);
    var issues = table("Broken / self / duplicate relations", ["Record", "Relation list", "Target", "Status"], R.issues.map(function (x) { return "<tr><td>" + openBtn(x.id) + "</td><td>" + esc(x.kind) + "</td><td><code>" + esc(x.target) + "</code></td><td>" + badge(x.status, "bad") + "</td></tr>"; }), { empty: "0 — no broken, self or duplicate relation." });
    var events = table("Life Event → Life Stage → topics", ["Life Event", "Stages", "Topics", "Status"], R.events.map(function (e) {
      return "<tr><td>" + openBtn(e.id, e.title) + "</td><td>" + esc(e.stages.join(", ")) + "</td><td>" + (e.topics.length ? e.topics.map(function (t) { return openBtn(t.id, t.title); }).join(" · ") : "—") + "</td><td>" + badge(e.status, e.status === "CONTENT GAP" ? "gap" : e.status === "linked" ? "ok" : "bad") + "</td></tr>";
    }));
    var matrix = table("Life Stage topics × related kind (topics with ≥ 1 link)", ["Stage", "Topics", "Policy", "Program", "Service", "Place", "Guide", "Topic"], R.matrix.map(function (m) { return "<tr><td>" + m.stage + "대</td>" + num(m.topics) + num(m.policy) + num(m.program) + num(m.service) + num(m.place) + num(m.guide) + num(m.topic) + "</tr>"; }));
    var ts = R.topics.filter(function (t) { return !state.topicStage || t.stage === state.topicStage; });
    var topicSel = '<div class="dm-toolbar"><div class="dm-field"><label for="dm-ts">Topic stage</label><select id="dm-ts" data-dm-topicstage><option value="">All</option>' + ["10", "20", "30", "40", "50", "60", "70"].map(function (s) { return '<option value="' + s + '"' + (state.topicStage === s ? " selected" : "") + ">" + s + "대</option>"; }).join("") + "</select></div></div>";
    var topics = table("Topic → Policy / Service / Program / Place / Guide (" + ts.length + ")", ["Topic", "Stage", "Policy", "Program", "Service", "Place", "Guide", "Topic"], ts.map(function (t) { return "<tr><td>" + openBtn(t.id, t.title) + "</td><td>" + t.stage + "</td>" + num(t.policy) + num(t.program) + num(t.service) + num(t.place) + num(t.guide) + num(t.topic) + "</tr>"; }));
    return '<div class="dm-callout">Missing relation is split in two: an <strong>error</strong> (a guide exists but is not linked) vs a ' + badge("CONTENT GAP", "gap") + " (no matching guide exists yet — no relation is invented).</div>" +
      '<div class="dm-section">' + issues + '</div><div class="dm-section">' + events + '</div><div class="dm-section">' + matrix + '</div><div class="dm-section">' + topicSel + topics + "</div>";
  };

  V.gaps = function () {
    var G = DM.contentGaps(model);
    return '<div class="dm-callout">' + badge("CONTENT GAP", "gap") + " = the taxonomy has a slot with nothing in it. Reported only; no content is generated.</div>" +
      table("Content gaps (" + G.length + ")", ["Kind", "Area", "Detail"], G.map(function (g) { return "<tr><td>" + esc(g.kind) + "</td><td>" + (/^le:/.test(g.id) ? openBtn(g.id, g.area) : esc(g.area)) + "</td><td>" + esc(g.detail) + "</td></tr>"; }));
  };

  V.sources = function () {
    return DM.sources(model).map(function (s) {
      return '<section class="dm-section"><h2>' + esc(s.cls + " · " + s.label) + "</h2><p class=\"dm-note\">" + s.count + " records · with official URL " + s.official + " · missing source " + s.missingSource + "</p>" +
        table(s.label + " sources", ["Source", "Records", "Official", "URLs"], s.names.map(function (n) { return "<tr><td>" + esc(n.name) + "</td>" + num(n.count) + num(n.official) + '<td class="dm-mono">' + n.urls.map(esc).join("<br>") + "</td></tr>"; }), { empty: "No record." }) + "</section>";
    }).join("");
  };

  V.unsourced = function () {
    var U = DM.unsourced(model);
    return '<div class="dm-callout dm-callout--warn">Values are shown as they are. Nothing is corrected automatically — an editor confirms against the official source.</div>' +
      table("Unsourced specifics & field conflicts (" + U.length + ")", ["Record", "Claim", "Field", "Current value", "Other field", "Source", "Flags", "Reason"], U.map(function (u) {
        return "<tr><td>" + openBtn(u.id, u.title) + "</td><td>" + esc(u.claim) + "</td><td>" + esc(u.field) + "</td><td>" + esc(u.value) + "</td><td>price: " + esc(u.price || "—") + '</td><td class="dm-mono">' + esc(u.source) + "</td><td>" + u.flags.map(function (f) { return badge(f === "FIELD_CONFLICT" ? "CONFLICT" : f, "warn"); }).join(" ") + "</td><td>" + esc(u.reason) + "</td></tr>";
      }));
  };

  V.dates = function () {
    var D = DM.dateReview(model), kinds = {}; D.forEach(function (d) { kinds[d.kind] = (kinds[d.kind] || 0) + 1; });
    var list = D.filter(function (d) { return !state.datesKind || d.kind === state.datesKind; });
    var sel = '<div class="dm-toolbar"><div class="dm-field"><label for="dm-dk">Kind</label><select id="dm-dk" data-dm-dateskind><option value="">All (' + D.length + ")</option>" + ["policy", "program", "event", "class", "application", "other"].map(function (k) { return '<option value="' + k + '"' + (state.datesKind === k ? " selected" : "") + ">" + k + " (" + (kinds[k] || 0) + ")</option>"; }).join("") + "</select></div></div>";
    return '<div class="dm-callout dm-callout--warn">No date is generated. These rows are marked <code>requiresDateVerification</code> until an official date is entered by an editor.</div>' + sel +
      table("DATE_VERIFICATION_REQUIRED (" + list.length + ")", ["Record", "Type", "Current dates", "Source", "Official URL", "Reason"], list.map(function (d) {
        var ds = Object.keys(d.dates).filter(function (k) { return d.dates[k]; }).map(function (k) { return k + " " + d.dates[k]; }).join(", ") || "none";
        return "<tr><td>" + openBtn(d.id, d.title) + "</td><td>" + esc(d.type) + "</td><td>" + esc(ds) + "</td><td>" + esc(d.source) + '</td><td class="dm-mono">' + esc(d.officialUrl || "—") + "</td><td>" + esc(d.reason) + "</td></tr>";
      }));
  };

  V.freshness = function () {
    var F = DM.freshness(model);
    return '<p class="dm-note">' + esc(F.note) + '</p><div class="dm-toolbar" role="group" aria-label="Freshness">' + Object.keys(F.counts).map(function (k) { return '<button type="button" class="dm-btn dm-btn--ghost" data-dm-goto=\'' + esc(JSON.stringify({ freshness: k })) + "'>" + esc(k) + " · " + F.counts[k] + "</button>"; }).join("") + "</div>" +
      table("Freshness by type", ["Type", "fresh", "stale", "expired", "unknown"], Object.keys(DM.dashboard(model).types).map(function (t) {
        var rs = model.records.filter(function (r) { return r.type === t; }); var c = function (k) { return rs.filter(function (r) { return r.freshness === k; }).length; };
        return "<tr><td>" + esc(t) + "</td>" + num(c("fresh")) + num(c("stale")) + num(c("expired")) + num(c("unknown")) + "</tr>";
      }));
  };

  V.search = function () {
    var out = "";
    if (state.searchQ) {
      var e = DM.searchTest(model, state.searchQ);
      out = '<p class="dm-note" data-dm-search-total>Tokens: ' + esc(e.tokens.join(" · ")) + (e.dropped && e.dropped.length ? " · dropped filler: " + esc(e.dropped.join(", ")) : "") + " · " + e.total + " results</p>" +
        table("Ranking for “" + e.query + "”", ["#", "Title", "Type", "Score", "Why (matched fields)"], e.items.slice(0, 50).map(function (x) {
          return num(x.rank).replace("<td", "<tr><td") + "<td>" + esc(x.title) + ' <span class="dm-mono">' + esc(x.key) + "</span></td><td>" + esc(x.typeLabel || x.type) + "</td>" + num(x.score) +
            '<td><ul class="dm-explain">' + x.parts.map(function (p) { return "<li>" + badge(p.kind, p.kind === "direct" ? "ok" : p.kind === "none" ? "bad" : "") + " " + esc(p.token) + " → " + esc(p.field) + " (" + p.score + ")</li>"; }).join("") + "</ul></td></tr>";
        }), { empty: "No result." });
    }
    return '<form class="dm-toolbar" data-dm-searchform role="search"><div class="dm-field dm-field--grow"><label for="dm-sq">Query (runs the live LIVON search engine, read-only)</label><input id="dm-sq" type="search" value="' + esc(state.searchQ) + '" autocomplete="off"></div><button type="submit" class="dm-btn">Search</button></form>' + out;
  };

  V["search-set"] = function () {
    var S = model._cache.searchSet;
    if (!S) return '<p class="dm-note">Runs the 66-query Content Quality test set against the current engine.</p><button type="button" class="dm-btn" data-dm-run-set>Run 66 queries</button>';
    var c = { PASS: 0, WEAK: 0, "ZERO RESULT": 0 }; S.forEach(function (s) { c[s.status]++; });
    return '<div class="dm-grid">' + kvCard("Result", c) + "</div>" + table("Search test set (" + S.length + ")", ["Query", "Status", "Results", "Relevant in top 5", "Top 3"], S.map(function (s) {
      return "<tr" + (s.status !== "PASS" ? ' class="dm-hl"' : "") + "><td>" + esc(s.q) + "</td><td>" + badge(s.status, s.status === "PASS" ? "ok" : s.status === "WEAK" ? "warn" : "bad") + "</td>" + num(s.total) + num(s.relevantTop5) + "<td>" + esc(s.top3.join(" · ")) + "</td></tr>";
    }));
  };

  V.recommend = function () {
    var r = state.rec, F = DM.facets(model), out = "";
    if (r.age || r.lifeStage || r.lifeEvent || r.interests) {
      var res = DM.recommend(model, { age: r.age, lifeStage: r.lifeStage, lifeEvent: r.lifeEvent, interests: r.interests.split(/[,\s]+/) });
      out = '<p class="dm-note">Context: ' + esc(JSON.stringify(res.context)) + " · " + esc(res.method) + "</p>" + table("Recommendations", ["#", "Title", "Type", "Score", "Reason"], res.items.map(function (x) {
        return "<tr>" + num(x.rank) + "<td>" + openBtn(x.id, x.title) + "</td><td>" + esc(x.type) + "</td>" + num(x.score) + "<td>" + esc(x.reasons.join(" · ")) + "</td></tr>";
      }), { empty: "No recommendation for this context." });
      /* the public onboarding rule on the same scenario (simulation only — no visitor profile is read) */
      var sim = DM.simulateOnboarding(model, { age: r.age, lifeStage: r.lifeStage, lifeEvents: r.lifeEvent ? [r.lifeEvent] : [], interests: r.interests.split(/[,\s]+/) });
      if (sim.available) out += '<p class="dm-note">Onboarding profile simulation · ' + esc(sim.engine) + " · profile " + esc(JSON.stringify(sim.profile)) + (sim.gaps.length ? " · content gap: " + esc(sim.gaps.map(function (g) { return g.id; }).join(", ")) : "") + "</p>" +
        table("Onboarding recommendations", ["#", "Title", "Kind", "Score", "Why (user-facing)", "Reasons"], sim.items.map(function (x) {
          return "<tr>" + num(x.rank) + "<td>" + openBtn(x.id, x.title) + "</td><td>" + esc(x.kind) + "</td>" + num(x.score) + "<td>" + esc(x.why) + "</td><td>" + esc(x.reasons.join(" · ")) + "</td></tr>";
        }), { empty: "No onboarding recommendation for this scenario (generic order is used)." });
    }
    return '<form class="dm-toolbar" data-dm-recform><div class="dm-field"><label for="dm-ra">Age</label><input id="dm-ra" name="age" type="number" min="10" max="120" value="' + esc(r.age) + '"></div>' +
      '<div class="dm-field"><label for="dm-rs">Life Stage</label><select id="dm-rs" name="lifeStage"><option value="">from age</option>' + F.lifeStage.map(function (s) { return '<option value="' + s + '"' + (r.lifeStage === s ? " selected" : "") + ">" + s + "대</option>"; }).join("") + "</select></div>" +
      '<div class="dm-field"><label for="dm-re">Life Event</label><select id="dm-re" name="lifeEvent"><option value="">none</option>' + F.lifeEvent.map(function (e) { return '<option value="' + esc(e.value) + '"' + (r.lifeEvent === e.value ? " selected" : "") + ">" + esc(e.label) + "</option>"; }).join("") + "</select></div>" +
      '<div class="dm-field dm-field--grow"><label for="dm-ri">Interests (comma separated)</label><input id="dm-ri" name="interests" value="' + esc(r.interests) + '" placeholder="건강, 돌봄"></div><button type="submit" class="dm-btn">Recommend</button></form>' +
      '<p class="dm-note">Uses only age / life stage / life event / interest — no personal data.</p>' + out;
  };

  V.taxonomy = function () {
    var T = DM.taxonomy(model);
    return '<p class="dm-note">Categories are display labels; filtering uses the 9 domains. Nothing is merged automatically — near-duplicates are marked ' + badge("TAXONOMY REVIEW", "warn") + ".</p>" +
      '<div class="dm-section">' + table("Near-duplicate labels (" + T.nearDuplicates.length + ")", ["Label A", "Label B", "Basis", "Status"], T.nearDuplicates.map(function (p) { return "<tr><td>" + esc(p.a) + "</td><td>" + esc(p.b) + "</td><td>" + esc(p.basis) + "</td><td>" + badge(p.status, "warn") + "</td></tr>"; })) + "</div>" +
      '<div class="dm-section">' + table("Categories (" + T.categories.length + ")", ["Category", "Records", "Types", "Screens", "Related categories"], T.categories.map(function (c) {
        return '<tr><td><button type="button" class="dm-btn--link" data-dm-goto=\'' + esc(JSON.stringify({ category: c.name })) + "'>" + esc(c.name) + "</button></td>" + num(c.count) + "<td>" + esc(c.types.join(", ")) + "</td><td>" + esc(c.screens.join(", ")) + "</td><td>" + esc(c.related.join(", ")) + "</td></tr>";
      })) + "</div>" + kvCard("Domains (records)", T.domains, { sort: true });
  };

  V.cta = function () {
    var C = DM.ctas(model);
    return '<p class="dm-note">"(screen default)" = the screen renders its own button (e.g. 공식 사이트에서 자세히 보기). Generic labels are queued as ' + badge("CTA REVIEW", "warn") + " — not changed automatically. “신청하기” without an official page: " + C.applyWithoutOfficialPage.length + ".</p>" +
      table("CTA labels (" + C.list.length + ")", ["CTA", "Records", "Status"], C.list.map(function (c) { return "<tr" + (c.generic ? ' class="dm-hl"' : "") + "><td>" + esc(c.cta) + "</td>" + num(c.count) + "<td>" + (c.generic ? badge("CTA REVIEW", "warn") : "") + "</td></tr>"; }));
  };

  V.coverage = function () {
    var C = DM.coverage(model);
    var res = DM.query(model, { filters: { coverage: state.coverage }, sort: "id", page: state.page, pageSize: 100 });
    var sel = '<div class="dm-toolbar"><div class="dm-field"><label for="dm-cov">Coverage filter</label><select id="dm-cov" data-dm-coverage>' + [["", "All"], ["only-one", "Only one screen (" + C.onlyOne + ")"], ["none", "No screen (" + C.none + ")"], ["not-searchable", "Not searchable (" + C.notSearchable + ")"], ["no-detail", "No detail (" + C.noDetail + ")"], ["no-my-life", "No My Life (" + C.noMyLife + ")"]].map(function (o) { return '<option value="' + o[0] + '"' + (state.coverage === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></div>" +
      '<nav class="dm-pager" aria-label="Pages"><button type="button" class="dm-btn dm-btn--ghost" data-dm-page="' + (res.page - 1) + '"' + (res.page <= 1 ? " disabled" : "") + ">Previous</button><span>" + res.total + " records · page " + res.page + " / " + res.pages + '</span><button type="button" class="dm-btn dm-btn--ghost" data-dm-page="' + (res.page + 1) + '"' + (res.page >= res.pages ? " disabled" : "") + ">Next</button></nav></div>";
    return '<div class="dm-grid">' + kvCard("Records per screen", C.totals) + "</div>" + sel +
      table("Screen coverage matrix", ["Record"].concat(C.screens), res.items.map(function (r) { return "<tr><td>" + openBtn(r.id) + "</td>" + C.screens.map(function (s) { var on = r.screens.indexOf(s) >= 0; return '<td class="dm-check">' + (on ? "●" : "·") + '<span class="dm-sr">' + (on ? "shown" : "not shown") + "</span></td>"; }).join("") + "</tr>"; }));
  };

  V["export"] = function () {
    return '<p class="dm-note">Read-only exports of what the tool computed. Only whitelisted content fields are written (no keys, tokens or storage). Files are downloaded to this computer; nothing is uploaded.</p>' +
      '<div class="dm-toolbar" role="group" aria-label="Export">' +
      '<button type="button" class="dm-btn" data-dm-export="all-json">All records · JSON</button><button type="button" class="dm-btn" data-dm-export="all-csv">All records · CSV</button>' +
      '<button type="button" class="dm-btn dm-btn--ghost" data-dm-export="filtered-json">Explorer filter · JSON</button><button type="button" class="dm-btn dm-btn--ghost" data-dm-export="filtered-csv">Explorer filter · CSV</button>' +
      '<button type="button" class="dm-btn dm-btn--ghost" data-dm-export="quality-json">Quality report · JSON</button><button type="button" class="dm-btn dm-btn--ghost" data-dm-export="review-json">My review marks · JSON</button></div>' +
      '<p class="dm-note">Review marks: ' + (store.persistent ? "saved in this browser (localStorage)" : "<strong>memory only</strong> — browser storage is blocked; marks disappear on reload") + '. <button type="button" class="dm-btn--link" data-dm-clear-review>Clear my review marks</button></p>';
  };

  /* ───────── inspector ───────── */
  function inspector(id, opener) {
    var d = DM.inspect(model, id); if (!d) return;
    var r = d.record, dlg = document.getElementById("dm-inspector");
    lastFocus = opener || document.activeElement;
    var row = function (k, v) { return "<dt>" + esc(k) + "</dt><dd>" + v + "</dd>"; };
    var rels = d.relations.map(function (g) { return "<li><strong>" + esc(g.kind) + "</strong> (" + g.items.length + "): " + g.items.map(function (x) { return (x.status === "ok" ? openBtn(x.id, x.title || x.id) : "<code>" + esc(x.id) + "</code>") + (x.status !== "ok" ? " " + badge(x.status, x.status === "external-tool" ? "" : "bad") : ""); }).join(" · ") + "</li>"; }).join("");
    var mark = store.record(id) || "";
    dlg.innerHTML = '<div class="dm-dialog__head"><div><p class="dm-note">' + esc(r.kind) + " · <code>" + esc(r.id) + '</code></p><h2 id="dm-insp-title">' + esc(r.title) + '</h2></div><button type="button" class="dm-btn dm-btn--ghost" data-dm-close aria-label="Close">Close</button></div>' +
      '<div class="dm-dialog__body"><h3>Where this record is shown</h3><p class="dm-exposure">' + d.exposure.map(function (x) { return badge(x.screen + (x.shown ? " ✓" : " —"), x.shown ? "ok" : ""); }).join("") + "</p>" +
      '<dl class="dm-dl">' + row("ID", "<code>" + esc(r.id) + "</code>") + row("Title", esc(r.title)) + row("Summary", esc(r.summary)) + row("Description", esc(r.description || "—")) + row("Type", esc(r.type)) +
      row("Category", esc(r.category || "—")) + row("Tags", esc(r.tags.join(", ") || "—")) + row("Keywords (domains)", esc(r.keywords.join(", ") || "—")) + row("Age", esc(r.general ? "general (all ages)" : r.ageGroup.map(function (s) { return s + "s"; }).join(", "))) +
      row("Life Stage", esc(r.lifeStage.join(", ") || "—")) + row("Life Event", esc(r.lifeEvent.join(", ") || "—")) + row("Source", esc(r.sourceClass + " · " + DM.SOURCE_CLASS_LABEL[r.sourceClass] + " · " + (r.sourceName || "") + " · " + r.sourceType + " · " + (r.verification || ""))) +
      row("Source URL", '<span class="dm-mono">' + esc(r.sourceUrl || "—") + "</span>") + row("Official URL", '<span class="dm-mono">' + esc(r.officialUrl || "—") + "</span>") + row("Route", '<span class="dm-mono">' + esc(r.href || "—") + "</span>") + row("CTA", esc(r.cta || "(screen default)")) +
      row("Dates", esc(["start " + (r.startDate || "—"), "end " + (r.endDate || "—"), "application end " + (r.applicationEnd || "—"), "last checked " + (r.lastCheckedAt || "—")].join(" · ")) + (r.requiresDateVerification ? " " + badge("requiresDateVerification", "warn") : "")) +
      row("Freshness", esc(r.freshness) + (r.hiddenReason ? " · hidden: " + esc(r.hiddenReason) : "")) + row("Quality", r.score + " " + gradeBadge(r.grade) + ' <span class="dm-note">(data-completeness QA)</span>') + row("Flags", flagsHtml(r) + (r.notes.length ? '<p class="dm-note">' + esc(r.notes.join("; ")) + "</p>" : "")) +
      row("Relations", rels ? "<ul>" + rels + "</ul>" : "—") + row("Referenced by", d.incoming.length ? d.incoming.slice(0, 30).map(function (x) { return openBtn(x.id, x.title || x.id); }).join(" · ") + (d.incoming.length > 30 ? " … +" + (d.incoming.length - 30) : "") : "—") +
      row("Review queue", d.queue.length ? d.queue.map(function (q) { return badge(q.priority + " " + q.rule, q.rule === "CONTENT_GAP" ? "gap" : flagKind(q.rule)); }).join(" ") : "—") +
      row("My review mark", '<label class="dm-sr" for="dm-insp-mark">Review mark</label><select id="dm-insp-mark" data-dm-mark="' + esc(id) + '"><option value="">—</option><option value="reviewed"' + (mark === "reviewed" ? " selected" : "") + '>reviewed</option><option value="needs-review"' + (mark === "needs-review" ? " selected" : "") + ">needs review</option></select>") +
      "</dl></div>";
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
    var c = dlg.querySelector("[data-dm-close]"); if (c) c.focus();
  }
  function closeInspector() {
    var dlg = document.getElementById("dm-inspector"); if (!dlg) return;
    if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  }

  /* ───────── export ───────── */
  function download(name, text, type) {
    var blob = new Blob([text], { type: type }), url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function doExport(kind) {
    var stamp = new Date().toISOString().slice(0, 10), filtered = DM.filterRecords(model, { q: state.q, filters: state.filters });
    if (kind === "all-json") download("livon-records-" + stamp + ".json", DM.exportJSON(model.records, model.report), "application/json");
    else if (kind === "all-csv") download("livon-records-" + stamp + ".csv", DM.exportCSV(model.records), "text/csv;charset=utf-8");
    else if (kind === "filtered-json") download("livon-records-filtered-" + stamp + ".json", DM.exportJSON(filtered, model.report), "application/json");
    else if (kind === "filtered-csv") download("livon-records-filtered-" + stamp + ".csv", DM.exportCSV(filtered), "text/csv;charset=utf-8");
    else if (kind === "quality-json") download("livon-content-quality-" + stamp + ".json", JSON.stringify(window.LivonContentQuality.evaluate(window, {}), null, 2), "application/json");
    else if (kind === "review-json") download("livon-review-marks-" + stamp + ".json", JSON.stringify(store.snapshot(), null, 2), "application/json");
  }

  /* ───────── shell / routing ───────── */
  function shell() {
    app.innerHTML = '<div class="dm-shell"><aside class="dm-side" aria-label="Data Manager sections"><p class="dm-brand">LIVON Data Manager</p><p class="dm-badges">' + badge("LOCAL", "local") + badge("READ-ONLY") + badge("QA", "warn") + "</p>" +
      '<nav aria-label="Sections"><ul class="dm-nav">' + VIEWS.map(function (v) { return '<li><a href="#' + v[0] + '" data-dm-nav="' + v[0] + '">' + esc(v[1]) + "</a></li>"; }).join("") + "</ul></nav></aside>" +
      '<main id="dm-main" class="dm-main" tabindex="-1"><header class="dm-head"><h1 data-dm-title></h1><span class="dm-note">' + model.records.length + " records · built " + esc(new Date().toLocaleString()) + ' · not published · not linked from LIVON</span></header><div data-dm-view></div></main><p class="dm-sr" role="status" data-dm-live></p></div>' +
      '<dialog id="dm-inspector" class="dm-dialog" aria-labelledby="dm-insp-title"></dialog>';
    app.setAttribute("data-dm-state", "ready");
  }
  function render(focusMain) {
    var v = VIEWS.filter(function (x) { return x[0] === state.view; })[0] || VIEWS[0];
    state.view = v[0];
    document.title = v[1] + " · LIVON Data Manager";
    app.querySelector("[data-dm-title]").textContent = v[1];
    app.querySelectorAll("[data-dm-nav]").forEach(function (a) { if (a.getAttribute("data-dm-nav") === v[0]) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var host = app.querySelector("[data-dm-view]");
    var active = document.activeElement && document.activeElement.id;
    host.innerHTML = V[v[0]]();
    host.setAttribute("data-dm-current", v[0]);
    var live = app.querySelector("[data-dm-live]"), cnt = host.querySelector("[data-dm-count]");
    if (live) live.textContent = v[1] + (cnt ? ": " + cnt.textContent : "");
    if (focusMain) app.querySelector("#dm-main").focus({ preventScroll: false });
    else if (active && document.getElementById(active) && host.contains(document.getElementById(active))) { var el = document.getElementById(active); el.focus(); if (el.setSelectionRange && el.type === "search") { var n = el.value.length; el.setSelectionRange(n, n); } }
  }
  function route() { var h = location.hash.replace(/^#/, "") || "dashboard"; var prev = state.view; state.view = h; if (prev !== h) state.page = 1; render(prev !== h); }

  /* ───────── events (delegated) ───────── */
  var qTimer = null;
  function onInput(e) {
    var t = e.target;
    if (t.hasAttribute("data-dm-q")) { clearTimeout(qTimer); qTimer = setTimeout(function () { state.q = t.value; state.page = 1; render(); }, 120); }
  }
  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute("data-dm-filter")) { state.filters[t.getAttribute("data-dm-filter")] = t.value; state.page = 1; render(); }
    else if (t.hasAttribute("data-dm-sort")) { state.sort = t.value; render(); }
    else if (t.hasAttribute("data-dm-dir")) { state.dir = t.value; render(); }
    else if (t.hasAttribute("data-dm-queue")) { state.queueP = t.value; render(); }
    else if (t.hasAttribute("data-dm-dateskind")) { state.datesKind = t.value; render(); }
    else if (t.hasAttribute("data-dm-topicstage")) { state.topicStage = t.value; render(); }
    else if (t.hasAttribute("data-dm-coverage")) { state.coverage = t.value; state.page = 1; render(); }
    else if (t.hasAttribute("data-dm-mark")) { store.setRecord(t.getAttribute("data-dm-mark"), t.value); }
  }
  function onClick(e) {
    var b = e.target.closest("button, a"); if (!b || !app.contains(b)) return;
    if (b.hasAttribute("data-dm-open")) { e.preventDefault(); inspector(b.getAttribute("data-dm-open"), b); }
    else if (b.hasAttribute("data-dm-close")) { closeInspector(); }
    else if (b.hasAttribute("data-dm-page")) { state.page = +b.getAttribute("data-dm-page"); render(); }
    else if (b.hasAttribute("data-dm-reset")) { state.filters = {}; state.q = ""; state.page = 1; state.sort = "id"; state.dir = "asc"; render(); }
    else if (b.hasAttribute("data-dm-goto")) { var f = {}; try { f = JSON.parse(b.getAttribute("data-dm-goto")); } catch (err) {} goExplorer(f); }
    else if (b.hasAttribute("data-dm-group")) { var cur = store.group(b.getAttribute("data-dm-group")), v = b.getAttribute("data-dm-value"); store.setGroup(b.getAttribute("data-dm-group"), cur === v ? "" : v); render(); }
    else if (b.hasAttribute("data-dm-export")) { doExport(b.getAttribute("data-dm-export")); }
    else if (b.hasAttribute("data-dm-run-set")) { b.disabled = true; b.textContent = "Running…"; setTimeout(function () { DM.runSearchSet(model); render(); }, 0); }
    else if (b.hasAttribute("data-dm-clear-review")) { store.clear(); render(); }
  }
  function onSubmit(e) {
    var f = e.target;
    if (f.hasAttribute("data-dm-searchform")) { e.preventDefault(); state.searchQ = f.querySelector("#dm-sq").value; render(); var i = document.getElementById("dm-sq"); if (i) i.focus(); }
    else if (f.hasAttribute("data-dm-recform")) { e.preventDefault(); state.rec = { age: f.age.value, lifeStage: f.lifeStage.value, lifeEvent: f.lifeEvent.value, interests: f.interests.value }; render(); }
  }
  function onClose(e) { if (e.target && e.target.id === "dm-inspector" && lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

  /* ───────── boot ───────── */
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("failed to load " + src)); }; document.body.appendChild(s); }); }
  SCRIPTS.reduce(function (p, src) { return p.then(function () { return loadScript(src); }); }, Promise.resolve())
    .then(function () { return window.LivonLifeHub.repo.load(); })
    .then(function () {
      model = DM.createModel(window);
      store = DM.reviewStore(safeStorage());
      window.__livonDataManager = { model: model, store: store }; /* local debugging */
      shell();
      app.addEventListener("input", onInput); app.addEventListener("change", onChange); app.addEventListener("click", onClick); app.addEventListener("submit", onSubmit);
      document.addEventListener("close", onClose, true);
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(function (err) {
      app.setAttribute("data-dm-state", "error");
      app.innerHTML = '<main class="dm-unavailable"><h1>Could not load LIVON data</h1><p>' + esc(err && err.message) + "</p><p>Serve the repository root locally: <code>node scripts/livon-data-manager.mjs</code></p></main>";
    });
})();
