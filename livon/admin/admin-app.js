/*
 * LIVON Admin (local prototype) — UI.
 * UI → LivonAdminService → adapter (LivonAdminStore local adapter). The UI never reads or writes storage itself.
 * Guard first: on any host other than localhost / 127.0.0.1 / ::1 / *.localhost / *.test nothing is loaded.
 */
(function () {
  "use strict";
  var DM = window.LivonDataManager, app = document.getElementById("ad-app");
  if (!DM || !DM.isAllowedHost(location.hostname) || !window.LivonAdminService || !window.LivonAdminStore) {
    document.title = "Unavailable";
    app.setAttribute("data-ad-state", "unavailable");
    app.innerHTML = '<main class="ad-unavailable"><h1>Unavailable</h1><p>This page is not available.</p></main>';
    return;
  }

  var svc = null, adapterInfo = {};
  var content = { q: "", filters: {}, sort: "id", dir: "asc", page: 1 };
  var local = { reviewP: "", reviewState: "", leFilter: "", flash: "" };
  var renderSeq = 0;

  /* ───────── helpers ───────── */
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function badge(t, k) { return '<span class="ad-badge' + (k ? " ad-badge--" + k : "") + '">' + esc(t) + "</span>"; }
  function statusBadge(s) { var k = { READY: "ok", ACTIVE: "ok", LIVE: "ok", "LOCAL-FIRST": "info", "LOCAL ONLY": "info", "LOCAL RULE-BASED": "info", "CODE READY": "info", "NOT CONNECTED": "warn", "NOT CONFIGURED": "warn", "BACKEND REQUIRED": "gap", DEFERRED: "gap", ERROR: "bad", UNAVAILABLE: "bad" }[s]; return badge(s, k); }
  function flagKind(f) { return /BROKEN|INVALID|MISSING_SOURCE|MISSING_SUMMARY|ORPHAN/.test(f) ? "bad" : /UNSOURCED|CONFLICT|DATE|STALE|TIME/.test(f) ? "warn" : /MISSING_RELATION|CONTENT_GAP/.test(f) ? "gap" : ""; }
  function flags(list, id) { return '<span class="ad-flags">' + (list || []).map(function (f) { var gap = f === "MISSING_RELATION" && svc.model && svc.model.gapEvents.indexOf(id) >= 0; return badge(gap ? "CONTENT GAP" : f, gap ? "gap" : flagKind(f)); }).join("") + "</span>"; }
  function rec(id, label) { return '<a href="#record/' + encodeURIComponent(id) + '">' + esc(label || id) + "</a>"; }
  function num(n) { return '<td class="num">' + esc(n == null ? "—" : n) + "</td>"; }
  function kv(title, obj) { var keys = Object.keys(obj || {}); return '<section class="ad-card" aria-label="' + esc(title) + '"><h2>' + esc(title) + '</h2>' + (keys.length ? '<dl class="ad-kv">' + keys.map(function (k) { return "<dt>" + esc(k) + "</dt><dd>" + esc(obj[k]) + "</dd>"; }).join("") + "</dl>" : empty("No data", "Nothing to count.")) + "</section>"; }
  function big(title, value, sub, attr) { return '<section class="ad-card" aria-label="' + esc(title) + '"><h2>' + esc(title) + '</h2><div class="ad-big"' + (attr ? " " + attr : "") + ">" + esc(value) + "</div>" + (sub ? '<p class="ad-note">' + sub + "</p>" : "") + "</section>"; }
  function empty(title, text) { return '<div class="ad-empty" role="status"><strong>' + esc(title) + "</strong>" + esc(text || "") + "</div>"; }
  function table(caption, head, rows, emptyMsg) {
    return '<div class="ad-scroll" role="region" tabindex="0" aria-label="' + esc(caption) + '"><table class="ad-table"><caption>' + esc(caption) + "</caption><thead><tr>" +
      head.map(function (h) { return '<th scope="col">' + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      (rows.length ? rows.join("") : '<tr><td colspan="' + head.length + '">' + esc(emptyMsg || "No rows.") + "</td></tr>") + "</tbody></table></div>";
  }
  function sel(id, label, name, options, value, attr) {
    return '<div class="ad-field"><label for="' + id + '">' + esc(label) + '</label><select id="' + id + '" ' + (attr || "") + ' data-name="' + esc(name) + '"><option value="">All</option>' +
      options.map(function (o) { var v = typeof o === "object" ? o.value : o, l = typeof o === "object" ? o.label : o; return '<option value="' + esc(v) + '"' + (String(value) === String(v) ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("") + "</select></div>";
  }
  function needModel() { if (!svc.model) return '<div class="ad-callout ad-callout--bad"><strong>Data unavailable.</strong> ' + esc(svc.modelError ? "Quality evaluator / data model error: " + svc.modelError : "No records are loaded (empty dataset).") + " Other Admin areas keep working.</div>"; return ""; }

  /* ───────── views ───────── */
  var V = {};
  V.overview = function () {
    var ops = svc.operationsStatus();
    var opsTable = table("Operations status (computed now — nothing is shown as LIVE unless it is)", ["Area", "Status", "Detail"], ops.map(function (o) { return "<tr><td>" + esc(o.label) + "</td><td>" + statusBadge(o.status) + "</td><td>" + esc(o.detail) + "</td></tr>"; }));
    var o = svc.overview();
    if (o.empty) return needModel() + opsTable;
    return '<div class="ad-grid">' + big("Total records", o.content.total, "searchable " + o.content.searchable + " · with detail page " + o.content.detail + " · content gaps " + o.content.contentGaps, "data-ad-total") +
      big("Average quality (data completeness QA)", o.quality.average, "active flag types " + o.quality.activeFlags) +
      '<section class="ad-card" aria-label="Review queue"><h2>Review queue</h2><dl class="ad-kv">' + Object.keys(o.review).map(function (p) { return '<dt><a href="#review/' + p + '">' + p + '</a></dt><dd data-ad-p="' + p + '">' + o.review[p] + "</dd>"; }).join("") + "</dl></section>" +
      kv("Quality grades", o.quality.grades) + kv("Content types", o.content.types) + kv("Sources", o.sources) + kv("Freshness", o.freshness) + kv("Records per screen", o.screens) + kv("Active flags", o.quality.flags) +
      '</div><div class="ad-section"><h2>Operations status</h2>' + opsTable + "</div>";
  };

  V.content = function () {
    if (!svc.model) return needModel();
    var F = DM.facets(svc.model), f = content.filters;
    var res = svc.content({ q: content.q, filters: f, sort: content.sort, dir: content.dir, page: content.page, pageSize: 50 });
    if (res.page !== content.page) content.page = res.page;
    var yn = [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }];
    var tools = '<form class="ad-toolbar" role="search" onsubmit="return false"><div class="ad-field ad-field--grow"><label for="ad-cq">Search content</label><input id="ad-cq" type="search" data-ad-cq value="' + esc(content.q) + '" autocomplete="off" placeholder="id, title, summary, tag, source…"></div>' +
      sel("ad-f-type", "Type", "type", F.type, f.type, "data-ad-cf") + sel("ad-f-cat", "Category", "category", F.category, f.category, "data-ad-cf") +
      sel("ad-f-age", "Age", "age", F.age.map(function (a) { return { value: a, label: a === "general" ? "general (all ages)" : a + "s" }; }), f.age, "data-ad-cf") +
      sel("ad-f-le", "Life Event", "lifeEvent", F.lifeEvent, f.lifeEvent, "data-ad-cf") + sel("ad-f-src", "Source", "sourceClass", F.sourceClass, f.sourceClass, "data-ad-cf") +
      sel("ad-f-grade", "Quality", "grade", F.grade, f.grade, "data-ad-cf") + sel("ad-f-flag", "Flag", "flag", F.flag, f.flag, "data-ad-cf") + sel("ad-f-pri", "Priority", "priority", F.priority, f.priority, "data-ad-cf") +
      sel("ad-f-fresh", "Freshness", "freshness", F.freshness, f.freshness, "data-ad-cf") + sel("ad-f-screen", "Screen", "screen", F.screen, f.screen, "data-ad-cf") +
      sel("ad-f-date", "Date verification", "dateVerification", yn, f.dateVerification, "data-ad-cf") + sel("ad-f-off", "Official URL", "hasOfficialUrl", yn, f.hasOfficialUrl, "data-ad-cf") +
      '<div class="ad-field"><label for="ad-sort">Sort</label><select id="ad-sort" data-ad-sort>' + [["id", "ID"], ["title", "Title"], ["type", "Type"], ["score", "Score"], ["updated", "Updated"], ["flags", "Flag count"]].map(function (x) { return '<option value="' + x[0] + '"' + (content.sort === x[0] ? " selected" : "") + ">" + x[1] + "</option>"; }).join("") + "</select></div>" +
      '<div class="ad-field"><label for="ad-dir">Order</label><select id="ad-dir" data-ad-dir><option value="asc"' + (content.dir === "asc" ? " selected" : "") + ">Ascending</option><option value=\"desc\"" + (content.dir === "desc" ? " selected" : "") + ">Descending</option></select></div>" +
      '<button type="button" class="ad-btn ad-btn--ghost" data-ad-creset>Reset</button></form>';
    var pager = '<nav class="ad-pager" aria-label="Pages"><span data-ad-count>' + res.total + ' records</span><button type="button" class="ad-btn ad-btn--ghost" data-ad-page="' + (res.page - 1) + '"' + (res.page <= 1 ? " disabled" : "") + ">Previous</button><span>Page " + res.page + " / " + res.pages + '</span><button type="button" class="ad-btn ad-btn--ghost" data-ad-page="' + (res.page + 1) + '"' + (res.page >= res.pages ? " disabled" : "") + ">Next</button></nav>";
    var rows = res.items.map(function (r) { return "<tr><td><code>" + rec(r.id) + "</code></td><td>" + esc(r.type) + "</td><td>" + esc(r.title) + "</td><td>" + esc(r.category || "") + "</td><td>" + esc(r.general ? "general" : r.ageGroup.join(",")) + "</td><td>" + esc(r.sourceClass + " · " + (r.sourceName || "")) + "</td>" + num(r.score) + "<td>" + flags(r.flags, r.id) + "</td><td>" + esc(r.screens.length) + "</td></tr>"; });
    return '<p class="ad-note">READ-ONLY view of the 530 curated records (same model as the Data Manager). Open a record to inspect it or to create a LOCAL DRAFT.</p>' + tools + pager +
      (res.total ? table("Content (" + res.total + ")", ["ID", "Type", "Title", "Category", "Age", "Source", "Score", "Flags", "Screens"], rows) : empty("No results for these filters", "Change the search or reset the filters.")) + pager;
  };

  V.record = function (param) {
    var id = decodeURIComponent(param || "");
    var d = svc.inspect(id);
    if (!d) return Promise.resolve('<div class="ad-callout ad-callout--bad"><strong>Record not found:</strong> <code>' + esc(id) + '</code>. It may have been removed or the link is wrong. <a href="#content">Back to Content</a></div>');
    var r = d.record;
    return Promise.all([svc.adapter.getDraft("draft:" + id), svc.reviewStates()]).then(function (x) {
      var draft = x[0], states = x[1];
      var row = function (k, v) { return "<dt>" + esc(k) + "</dt><dd>" + v + "</dd>"; };
      var rels = d.relations.map(function (g) { return "<li><strong>" + esc(g.kind) + "</strong> (" + g.items.length + "): " + g.items.map(function (it) { return it.status === "ok" ? rec(it.id, it.title || it.id) : "<code>" + esc(it.id) + "</code> " + badge(it.status, it.status === "external-tool" ? "" : "bad"); }).join(" · ") + "</li>"; }).join("");
      var issues = d.queue.map(function (q) { var key = svc.issueKey(q); return "<li>" + badge(q.priority + " " + q.rule, flagKind(q.rule)) + " " + esc(q.note || "") + " — state " + badge(states[key] || "OPEN") + "</li>"; }).join("");
      var editor = '<section class="ad-section" aria-labelledby="ad-draft-h"><h2 id="ad-draft-h">Edit preview ' + badge("LOCAL DRAFT", "draft") + '</h2><div class="ad-callout ad-callout--warn">Saving creates a <strong>local draft in this browser only</strong>. The curated files and the public LIVON screens are not changed.</div>' +
        '<form class="ad-toolbar" data-ad-draftform data-id="' + esc(id) + '">' +
        '<div class="ad-field ad-field--grow"><label for="ad-e-title">Title</label><input id="ad-e-title" name="title" value="' + esc(draft && "title" in draft.after ? draft.after.title : r.title) + '"></div>' +
        '<div class="ad-field"><label for="ad-e-cat">Category</label><input id="ad-e-cat" name="category" value="' + esc(draft && "category" in draft.after ? draft.after.category : r.category || "") + '"></div>' +
        '<div class="ad-field"><label for="ad-e-cta">CTA</label><input id="ad-e-cta" name="cta" value="' + esc(draft && "cta" in draft.after ? draft.after.cta || "" : r.cta || "") + '"></div>' +
        '<div class="ad-field ad-field--grow" style="flex-basis:100%"><label for="ad-e-sum">Summary</label><textarea id="ad-e-sum" name="summary">' + esc(draft && "summary" in draft.after ? draft.after.summary : r.summary) + "</textarea></div>" +
        '<div class="ad-field ad-field--grow"><label for="ad-e-tags">Tags (comma separated)</label><input id="ad-e-tags" name="tags" value="' + esc((draft && "tags" in draft.after ? draft.after.tags : r.tags).join(", ")) + '"></div>' +
        '<button type="submit" class="ad-btn">Save Draft (local)</button></form><div data-ad-draftmsg role="status">' + (local.flash ? local.flash : "") + "</div>" + (draft ? draftBlock(draft) : "") + "</section>";
      local.flash = "";
      return '<p class="ad-note">' + esc(r.kind) + " · <code>" + esc(r.id) + "</code></p>" +
        '<div class="ad-grid">' + big("Quality (data completeness QA)", r.score, badge(r.grade, r.grade === "Excellent" || r.grade === "Good" ? "ok" : "warn")) +
        '<section class="ad-card" aria-label="Where it is shown"><h2>Where it is shown</h2><p>' + d.exposure.map(function (x) { return badge(x.screen + (x.shown ? " ✓" : " —"), x.shown ? "ok" : ""); }).join(" ") + "</p></section>" +
        '<section class="ad-card" aria-label="Operations"><h2>Operations</h2><dl class="ad-kv"><dt>Searchable</dt><dd>' + (d.ops.searchable ? "yes" : "no") + "</dd><dt>Detail page</dt><dd>" + (d.ops.hasDetail ? "yes" : "no") + "</dd><dt>Freshness</dt><dd>" + esc(r.freshness) + "</dd><dt>Planned</dt><dd>" + (d.ops.planned ? "yes" : "no") + "</dd><dt>Draft</dt><dd>" + (draft ? esc(draft.status) : "none") + "</dd></dl></section></div>" +
        '<dl class="ad-dl">' + row("Title", esc(r.title)) + row("Summary", esc(r.summary)) + row("Description", esc(r.description || "—")) + row("Type", esc(r.type)) + row("Category", esc(r.category || "—")) +
        row("Tags", esc(r.tags.join(", ") || "—")) + row("Keywords (domains)", esc(r.keywords.join(", ") || "—")) + row("Age", esc(r.general ? "general (all ages)" : r.ageGroup.map(function (s) { return s + "s"; }).join(", "))) +
        row("Life Stage", esc(r.lifeStage.join(", ") || "—")) + row("Life Event", esc(r.lifeEvent.join(", ") || "—")) +
        row("Source", esc(r.sourceClass + " · " + DM.SOURCE_CLASS_LABEL[r.sourceClass] + " · " + (r.sourceName || "") + " · " + r.sourceType + " · " + (r.verification || ""))) +
        row("Official URL", '<span class="ad-mono">' + esc(r.officialUrl || "—") + "</span>") + row("Source URL", '<span class="ad-mono">' + esc(r.sourceUrl || "—") + "</span>") + row("Route", '<span class="ad-mono">' + esc(r.href || "—") + "</span>") +
        row("CTA", esc(r.cta || "(screen default)")) + row("Dates", esc(["start " + (r.startDate || "—"), "end " + (r.endDate || "—"), "application end " + (r.applicationEnd || "—"), "last checked " + (r.lastCheckedAt || "—")].join(" · ")) + (r.requiresDateVerification ? " " + badge("DATE VERIFICATION REQUIRED", "warn") : "")) +
        row("Flags", flags(r.flags, r.id) + (r.notes.length ? '<p class="ad-note">' + esc(r.notes.join("; ")) + "</p>" : "")) + row("Relations", rels ? "<ul>" + rels + "</ul>" : "—") +
        row("Referenced by", d.incoming.length ? d.incoming.slice(0, 30).map(function (x) { return rec(x.id, x.title || x.id); }).join(" · ") + (d.incoming.length > 30 ? " … +" + (d.incoming.length - 30) : "") : "—") +
        row("Review issues", issues ? "<ul>" + issues + "</ul>" : "none") + "</dl>" + editor;
    });
  };
  function draftBlock(dr) {
    var D = svc.diff(dr);
    var next = { DRAFT: ["READY_FOR_REVIEW"], READY_FOR_REVIEW: ["APPROVED_LOCAL", "REJECTED_LOCAL", "DRAFT"], APPROVED_LOCAL: ["DRAFT"], REJECTED_LOCAL: ["DRAFT"] }[dr.status] || [];
    var show = function (v) { return Array.isArray(v) ? v.join(", ") : v == null ? "—" : v; };
    return '<div class="ad-section"><h3>Draft ' + badge("LOCAL DRAFT", "draft") + " " + badge(dr.status, "info") + ' <span class="ad-note">created ' + esc(dr.createdAt) + " · updated " + esc(dr.updatedAt) + "</span></h3>" +
      '<div class="ad-scroll" role="region" tabindex="0" aria-label="Before and after"><table class="ad-table ad-diff"><caption>Before / After (changed fields highlighted)</caption><thead><tr><th scope="col">Field</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Changed</th></tr></thead><tbody>' +
      D.map(function (x) { return "<tr><td>" + esc(x.field) + "</td><td" + (x.changed ? ' class="ad-changed"' : "") + ">" + esc(show(x.before)) + "</td><td" + (x.changed ? ' class="ad-changed"' : "") + ">" + esc(show(x.after)) + "</td><td>" + (x.changed ? badge("changed", "warn") : "") + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<div class="ad-toolbar" role="group" aria-label="Draft status (local simulation)">' + next.map(function (s) { return '<button type="button" class="ad-btn ad-btn--ghost" data-ad-dstatus="' + s + '" data-id="' + esc(dr.id) + '">Mark ' + s + "</button>"; }).join("") +
      '<button type="button" class="ad-btn ad-btn--ghost" data-ad-ddiscard="' + esc(dr.id) + '">Discard draft</button></div></div>';
  }

  V["life-stage"] = function (param) {
    if (!svc.model) return needModel();
    var S = svc.lifeStages();
    var rows = S.map(function (s) { return '<tr><td><a href="#life-stage/' + s.stage + '">' + esc(s.label) + "</a></td>" + num(s.topics) + num(s.content) + num(s.policy) + num(s.service) + num(s.program) + num(s.place) + num(s["class"]) + num(s.flagged) + num(s.gaps) + "</tr>"; });
    var out = '<p class="ad-note">Counts are unique related entities of the stage\'s topics (from their relations), computed now.</p>' + table("Life Stages (" + S.reduce(function (n, s) { return n + s.topics; }, 0) + " topics)", ["Stage", "Topics", "Content", "Policy", "Service", "Program", "Place", "Class", "Flagged topics", "Gaps"], rows);
    var st = S.filter(function (s) { return s.stage === param; })[0];
    if (param && !st) out += '<div class="ad-callout ad-callout--bad">Unknown stage “' + esc(param) + '”.</div>';
    if (st) {
      var gaps = DM.contentGaps(svc.model).filter(function (g) { return g.area.indexOf(st.stage + "대") === 0; });
      out += '<div class="ad-section"><h2>' + esc(st.label) + " — " + st.topics + " topics</h2>" + (gaps.length ? '<div class="ad-callout ad-callout--gap">' + badge("CONTENT GAP", "gap") + " " + gaps.map(function (g) { return esc(g.area + " (" + g.kind + ")"); }).join(" · ") + "</div>" : "") +
        table("Topics", ["Topic", "Category", "Related", "Searchable", "Score", "Flags"], st.topicList.map(function (t) { return "<tr><td>" + rec(t.id, t.title) + "</td><td>" + esc(t.category) + "</td>" + num(t.related) + "<td>" + (t.searchable ? "yes" : badge("no", "warn")) + "</td>" + num(t.score) + "<td>" + flags(t.flags, t.id) + "</td></tr>"; })) + "</div>";
    }
    return out;
  };

  V["life-events"] = function (param) {
    if (param) { location.replace("#record/" + param); return ""; }
    if (!svc.model) return needModel();
    var E = svc.lifeEvents();
    var list = E.filter(function (e) { return !local.leFilter || (local.leFilter === "planned" ? e.planned : local.leFilter === "gap" ? e.status === "CONTENT GAP" : !e.planned); });
    return '<div class="ad-toolbar"><div class="ad-field"><label for="ad-le-f">Show</label><select id="ad-le-f" data-ad-lef><option value="">All (' + E.length + ')</option><option value="guide"' + (local.leFilter === "guide" ? " selected" : "") + ">Guides (" + E.filter(function (e) { return !e.planned; }).length + ')</option><option value="planned"' + (local.leFilter === "planned" ? " selected" : "") + ">Planned / 확장 예정 (" + E.filter(function (e) { return e.planned; }).length + ')</option><option value="gap"' + (local.leFilter === "gap" ? " selected" : "") + ">Content gap (" + E.filter(function (e) { return e.status === "CONTENT GAP"; }).length + ")</option></select></div></div>" +
      table("Life Events (" + list.length + ")", ["Life Event", "Status", "Stages", "Related topics", "Related content", "Searchable", "Quality"], list.map(function (e) {
        return "<tr><td>" + rec(e.id, e.title) + "</td><td>" + (e.planned ? badge("PLANNED", "info") + " " : "") + badge(e.status, e.status === "CONTENT GAP" ? "gap" : "ok") + "</td><td>" + esc(e.stages.join(", ")) + "</td><td>" + (e.topics.length ? e.topics.map(function (t) { return rec(t.id, t.title); }).join(" · ") : "—") + "</td>" + num(e.relatedContent) + "<td>" + (e.searchable ? "yes" : "no") + "</td><td>" + e.score + " " + esc(e.grade) + "</td></tr>";
      }), "No Life Event matches.");
  };

  V.today = function () {
    if (!svc.model) return needModel();
    var T = svc.today();
    return '<div class="ad-grid">' + big("Items", T.items.length, T.sections.length + " sections") + big("UNSOURCED_SPECIFIC", T.unsourced, "budget estimates without an official link") + big("FIELD_CONFLICT", T.conflicts, "budget vs price disagree") + "</div>" +
      table("Sections", ["Section", "Items", "Sources", "Budgets", "Avg quality", "Freshness", "Date status", "Flagged"], T.sections.map(function (s) {
        var j = function (o) { return Object.keys(o).map(function (k) { return k + " " + o[k]; }).join(" · "); };
        return "<tr" + (s.flagged ? ' class="ad-hl"' : "") + "><td>" + esc(s.section) + "</td>" + num(s.count) + "<td>" + esc(j(s.sources)) + "</td><td>" + esc(j(s.budgets)) + "</td>" + num(s.avgScore) + "<td>" + esc(j(s.freshness)) + "</td><td>" + esc(j(s.dateStatus)) + "</td>" + num(s.flagged) + "</tr>";
      })) + '<div class="ad-section">' + table("Items", ["Item", "Section", "Category", "Source", "Budget", "Price", "Quality", "Freshness", "Date status", "Flags"], T.items.map(function (x) {
        return "<tr><td>" + rec(x.id, x.title) + "</td><td>" + esc(x.section) + "</td><td>" + esc(x.category) + "</td><td>" + esc(x.source) + "</td><td>" + esc(x.budget || "—") + "</td><td>" + esc(x.price || "—") + "</td>" + num(x.score) + "<td>" + esc(x.freshness) + "</td><td>" + esc(x.dateStatus) + "</td><td>" + flags(x.flags, x.id) + "</td></tr>";
      })) + '</div><p class="ad-note">The public Today screen is not changed by anything here.</p>';
  };

  V.explore = function () {
    if (!svc.model) return needModel();
    var X = svc.explore();
    var j = function (o) { return Object.keys(o).map(function (k) { return k + " " + o[k]; }).join(" · "); };
    return '<div class="ad-callout ad-callout--gap"><strong>Experts: ' + X.expertProfiles + " individual profiles.</strong> " + esc(X.expertNote) + "</div>" +
      table("By card type", ["Type", "Count", "Official", "Sources", "Freshness", "Avg quality"], Object.keys(X.byType).map(function (t) { var g = X.byType[t]; return "<tr><td>" + esc(t) + "</td>" + num(g.count) + num(g.official) + "<td>" + esc(j(g.sources)) + "</td><td>" + esc(j(g.freshness)) + "</td>" + num(g.avgScore) + "</tr>"; })) +
      '<div class="ad-section">' + table("By Explore category", ["Category", "Count", "Official", "Freshness", "Avg quality"], X.byCategory.map(function (g) { return "<tr><td>" + esc(g.label) + " <code>" + esc(g.id) + "</code></td>" + num(g.count) + num(g.official) + "<td>" + esc(j(g.freshness)) + "</td>" + num(g.avgScore) + "</tr>"; })) + "</div>" +
      '<div class="ad-section">' + table("Items", ["Item", "Type", "Categories", "Source", "Official", "Freshness", "Quality", "Detail route"], X.items.map(function (x) { return "<tr><td>" + rec(x.id, x.title) + "</td><td>" + esc(x.uiType) + "</td><td>" + esc(x.categories.join(", ")) + "</td><td>" + esc(x.source) + "</td><td>" + (x.official ? "yes" : "no") + "</td><td>" + esc(x.freshness) + "</td>" + num(x.score) + '<td class="ad-mono">' + esc(x.route) + "</td></tr>"; })) + "</div>";
  };

  V.community = function (param) {
    if (!svc.model) return needModel();
    return Promise.all([svc.adapter.readCommunitySnapshot(), svc.moderationStates()]).then(function (x) {
      var C = svc.community(x[0]), mod = x[1], tab = param || "posts";
      var tabs = '<div class="ad-toolbar" role="group" aria-label="Community sections">' + [["posts", "Posts"], ["reports", "Reports"], ["moderation", "Moderation"], ["profiles", "Profiles"], ["groups", "Groups & challenges"]].map(function (t) { return '<a class="ad-btn ad-btn--ghost" href="#community/' + t[0] + '"' + (tab === t[0] ? ' aria-current="page"' : "") + ">" + t[1] + "</a>"; }).join("") + "</div>";
      var head = '<div class="ad-callout ad-callout--gap">Community backend: ' + statusBadge(C.backend) + " " + esc(C.note) + "</div>";
      var body;
      if (tab === "groups") body = table("Curated groups (" + C.curated.groups.length + ")", ["Group", "Interest", "Quality"], C.curated.groups.map(function (g) { return "<tr><td>" + rec(g.id, g.title) + "</td><td>" + esc(g.category) + "</td>" + num(g.score) + "</tr>"; })) + '<div class="ad-section">' + table("Curated challenges (" + C.curated.challenges.length + ")", ["Challenge", "Field", "Quality"], C.curated.challenges.map(function (g) { return "<tr><td>" + rec(g.id, g.title) + "</td><td>" + esc(g.category) + "</td>" + num(g.score) + "</tr>"; })) + "</div>";
      else if (tab === "profiles") body = empty("Profiles — BACKEND REQUIRED", "Member profiles exist only with an account backend (NEWON+ is deferred). No profile data is shown or invented.");
      else if (tab === "reports") body = !C.device.available ? empty("No device data", C.device.reason) : C.device.reports ? '<p class="ad-note">' + C.device.reports + " report(s) stored in this browser. Report content stays on the device; handling requires the community backend.</p>" : empty("No reports", "No report exists in this browser's community store.");
      else {
        if (!C.device.available) body = empty("No posts in this browser", C.device.reason + ". Posts written on other devices are not visible — there is no server.");
        else if (!C.device.posts.length) body = empty("No posts", "The community store in this browser has no posts.");
        else body = '<p class="ad-note">' + C.device.posts.length + " posts · " + C.device.comments + " comments · " + C.device.reports + " reports · types " + esc(Object.keys(C.postTypes).map(function (k) { return k + " " + C.postTypes[k]; }).join(", ")) + "</p>" +
          table("Posts in this browser (read-only) · moderation is a LOCAL SIMULATION", ["Post", "Type", "Visibility", "Local moderation"], C.device.posts.map(function (p) {
            var cur = mod["post:" + p.id] || "";
            return "<tr><td>" + esc(p.title || p.id) + " <code>" + esc(p.id) + "</code></td><td>" + esc(p.type) + "</td><td>" + esc(p.visibility + (p.deleted ? " · deleted" : "") + (p.draft ? " · draft" : "")) + '</td><td><label class="ad-sr" for="ad-mod-' + esc(p.id) + '">Local moderation for ' + esc(p.id) + '</label><select id="ad-mod-' + esc(p.id) + '" data-ad-mod="' + esc(p.id) + '"><option value="">—</option>' +
              LivonAdminStore.MODERATION_STATES.map(function (s) { return '<option value="' + s + '"' + (cur === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td></tr>";
          }));
        if (tab === "moderation") body = '<div class="ad-callout ad-callout--warn">Moderation here is a <strong>local simulation</strong>: FLAGGED / HIDDEN_LOCAL / NEEDS_REVIEW / RESOLVED_LOCAL marks are stored in the Admin only. Nothing is deleted, hidden or suspended on LIVON.</div>' +
          table("Local moderation marks (" + Object.keys(mod).length + ")", ["Item", "State"], Object.keys(mod).map(function (k) { return "<tr><td><code>" + esc(k) + "</code></td><td>" + badge(mod[k], "warn") + "</td></tr>"; }), "No local moderation marks.") + '<div class="ad-section">' + body + "</div>";
      }
      return head + tabs + body;
    });
  };

  V.quality = function () {
    if (!svc.model) return needModel();
    var Q = svc.quality();
    return '<div class="ad-callout ad-callout--warn">Quality score = <strong>data-completeness QA</strong>, never shown to LIVON users. 90–100 Excellent · 75–89 Good · 60–74 Needs Review · &lt;60 Poor.</div>' +
      '<div class="ad-grid">' + kv("Grades", Q.grades) + big("Average", Q.average, Q.activeFlags.length + " active flag types") + "</div>" +
      table("Flags (from the shared evaluator — new flags appear automatically)", ["Flag", "Meaning", "Records", ""], Q.flags.map(function (f) {
        return "<tr" + (f.count ? ' class="ad-hl"' : "") + "><td>" + badge(f.flag, flagKind(f.flag)) + "</td><td>" + esc(f.meaning) + "</td>" + num(f.count) + "<td>" + (f.count ? '<button type="button" class="ad-btn ad-btn--ghost" data-ad-goflag="' + esc(f.flag) + '">Show in Content</button>' : "") + "</td></tr>";
      })) + '<p class="ad-note">The same numbers are in the Data Manager (<a href="/livon/admin/data/#quality">open</a>) — one model, one evaluator.</p>';
  };

  V.review = function (param) {
    if (!svc.model) return Promise.resolve(needModel());
    if (param && /^P[0-4]$/.test(param)) local.reviewP = param;
    return svc.reviewStates().then(function (states) {
      var Q = svc.reviewQueue(states);
      var items = Q.items.filter(function (i) { return (!local.reviewP || i.priority === local.reviewP) && (!local.reviewState || i.state === local.reviewState); });
      var shown = items.slice(0, 300);
      var stateCounts = {}; Q.items.forEach(function (i) { stateCounts[i.state] = (stateCounts[i.state] || 0) + 1; });
      return '<div class="ad-grid">' + Q.rules.map(function (r) { return big(r.p + " · " + r.label, Q.counts[r.p], "", 'data-ad-p="' + r.p + '"'); }).join("") + kv("Local review states", stateCounts) + "</div>" +
        '<div class="ad-toolbar"><div class="ad-field"><label for="ad-rp">Priority</label><select id="ad-rp" data-ad-rp><option value="">All</option>' + ["P0", "P1", "P2", "P3", "P4"].map(function (p) { return '<option value="' + p + '"' + (local.reviewP === p ? " selected" : "") + ">" + p + " (" + Q.counts[p] + ")</option>"; }).join("") + "</select></div>" +
        '<div class="ad-field"><label for="ad-rs">State</label><select id="ad-rs" data-ad-rs><option value="">All</option>' + LivonAdminStore.REVIEW_STATES.map(function (s) { return '<option value="' + s + '"' + (local.reviewState === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div></div>" +
        (Q.counts.P0 === 0 ? '<p class="ad-note">' + badge("P0 = 0", "ok") + " no blocking issue.</p>" : "") +
        table("Issues (" + items.length + (items.length > shown.length ? ", first " + shown.length + " shown" : "") + ")", ["P", "Rule", "Record", "Note", "State"], shown.map(function (i) {
          return "<tr><td>" + i.priority + "</td><td>" + badge(i.rule, flagKind(i.rule)) + "</td><td>" + (i.recordId ? rec(i.recordId, i.title) : esc(i.title)) + "</td><td>" + esc(i.note) + '</td><td><label class="ad-sr" for="ad-st-' + esc(i.key) + '">State of ' + esc(i.key) + '</label><select id="ad-st-' + esc(i.key) + '" data-ad-istate="' + esc(i.key) + '">' +
            LivonAdminStore.REVIEW_STATES.map(function (s) { return '<option value="' + s + '"' + (i.state === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td></tr>";
        }), local.reviewP || local.reviewState ? "No issue matches these filters." : "No review issue — the queue is empty.");
    });
  };

  V.sources = function () {
    if (!svc.model) return needModel();
    var j = function (o) { return Object.keys(o).map(function (k) { return k + " " + o[k]; }).join(" · "); };
    return svc.sources().map(function (s) {
      return '<section class="ad-section"><h2>' + esc(s.cls + " · " + s.label) + '</h2><p class="ad-note">' + s.count + " records · official " + s.official + " · missing source " + s.missingSource + " · date verification " + s.dateVerification + " · with quality issues " + s.qualityIssues + " · freshness " + esc(j(s.freshness)) + "</p>" +
        (s.count ? table(s.label + " sources", ["Source", "Records", "Official", "URLs"], s.names.map(function (n) { return "<tr><td>" + esc(n.name) + "</td>" + num(n.count) + num(n.official) + '<td class="ad-mono">' + n.urls.map(esc).join("<br>") + "</td></tr>"; })) : empty("No records", "No record belongs to this source class.")) + "</section>";
    }).join("");
  };

  V.providers = function () {
    var P = svc.providers();
    if (!P.available) return empty("Provider status unavailable", P.reason);
    return '<div class="ad-callout ad-callout--warn">' + esc(P.note) + "</div>" +
      table("Real-data providers (" + P.rows.length + ")", ["Provider", "Data type", "Status", "Key required", "Last fetch", "Last success", "Last failure", "Records", "Error type"], P.rows.map(function (r) {
        return '<tr><td><a href="#provider/' + esc(r.id) + '">' + esc(r.id) + "</a></td><td>" + esc(r.dataType) + "</td><td>" + statusBadge(r.status) + "</td><td>" + (r.keyRequired ? "yes" : "no") + "</td><td>" + esc(r.lastFetch || "never") + "</td><td>" + esc(r.lastSuccess || "never") + "</td><td>" + esc(r.lastFailure || "—") + "</td>" + num(r.recordCount) + "<td>" + esc(r.errorType || "—") + "</td></tr>";
      }));
  };
  V.provider = function (param) {
    var d = svc.providerDetail(param);
    if (!d) return '<div class="ad-callout ad-callout--bad"><strong>Provider not found:</strong> <code>' + esc(param) + '</code>. <a href="#providers">All providers</a></div>';
    var row = function (k, v) { return "<dt>" + esc(k) + "</dt><dd>" + v + "</dd>"; };
    return '<dl class="ad-dl">' + row("Provider ID", "<code>" + esc(d.id) + "</code>") + row("Organization", esc(d.sourceOrganization)) + row("Official source", '<span class="ad-mono">' + esc(d.officialSource) + "</span>") + row("Data type", esc(d.dataType) + " · " + esc(d.sourceKind)) +
      row("Environment variable", "<code>" + esc(d.envVar) + "</code> (name only — values live on the server and are never shown)") + row("Key required", d.keyRequired ? "yes" : "no") + row("Approval required", esc(d.approvalRequired)) +
      row("Normalizer", '<span class="ad-mono">' + esc(d.normalizer || "—") + "</span>") + row("Mode", esc(d.mode)) + row("Capabilities", esc(JSON.stringify(d.capabilities))) + row("Cache policy", esc(d.cachePolicy)) + row("Freshness policy", esc(d.freshnessPolicy)) +
      row("Readiness", d.readiness.map(function (x) { return badge(x, /CODE READY/.test(x) ? "info" : "warn"); }).join(" ")) + row("Live verified", d.liveVerified ? "yes" : "no") + row("Last status", statusBadge(d.lastStatus)) + row("Records", String(d.recordCount)) + row("Error type", esc(d.errorType || "—")) + "</dl>";
  };

  V.reports = function (param) {
    var list = '<ul class="ad-nav" aria-label="Reports">' + svc.REPORTS.map(function (r) { return '<li><a href="#reports/' + r.id + '"' + (param === r.id ? ' aria-current="page"' : "") + ">" + esc(r.title) + "</a></li>"; }).join("") + "</ul>";
    if (!param) return '<p class="ad-note">Every report is generated from the current data. Export uses the Data Manager field whitelist; local review/draft states and secrets are never included (except the review state column of the Review Queue report).</p><div class="ad-card">' + list + "</div>";
    return svc.reviewStates().then(function (states) {
      var r; try { r = svc.report(param, states); } catch (e) { return needModel(); }
      if (!r) return '<div class="ad-callout ad-callout--bad">Unknown report “' + esc(param) + '”.</div><div class="ad-card">' + list + "</div>";
      var cols = r.records ? ["id", "type", "title", "category", "sourceClass", "score", "grade", "flags"] : r.columns;
      var rows = r.rows.slice(0, 100).map(function (x) { return "<tr>" + cols.map(function (c) { var v = x[c]; return "<td>" + esc(Array.isArray(v) ? v.join(", ") : v == null ? "" : typeof v === "object" ? JSON.stringify(v) : v) + "</td>"; }).join("") + "</tr>"; });
      return '<div class="ad-toolbar" role="group" aria-label="Export ' + esc(r.def.title) + '"><button type="button" class="ad-btn" data-ad-export="' + param + '" data-format="json">Export JSON</button><button type="button" class="ad-btn" data-ad-export="' + param + '" data-format="csv">Export CSV</button> <a href="#reports">All reports</a></div>' +
        (r.empty ? empty("No data", r.empty) : table(r.def.title + " (" + r.rows.length + " rows" + (r.rows.length > 100 ? ", first 100 shown" : "") + ")", cols, rows, "This report has no rows."));
    });
  };

  V.drafts = function () {
    return svc.listDrafts().then(function (list) {
      if (!list.length) return '<div class="ad-callout ad-callout--warn">Drafts are ' + badge("LOCAL DRAFT", "draft") + " only. They are never applied to LIVON.</div>" + empty("No local drafts", "Open a record in Content and use “Edit preview” to create one.");
      return '<div class="ad-callout ad-callout--warn">Drafts are ' + badge("LOCAL DRAFT", "draft") + " only. They are never applied to LIVON.</div>" +
        table("Local drafts (" + list.length + ")", ["Record", "Changed fields", "Status", "Updated"], list.map(function (d) { return "<tr><td>" + rec(d.recordId) + "</td><td>" + esc(d.changedFields.join(", ")) + "</td><td>" + badge(d.status, "info") + "</td><td>" + esc(d.updatedAt) + "</td></tr>"; }));
    });
  };
  V.audit = function () {
    return svc.listAudit({ limit: 200 }).then(function (list) {
      return '<p class="ad-note">Local audit events (timestamp · action · entity · before · after). Same shape a server audit log will use. No secrets or personal data are recorded.</p>' +
        (list.length ? table("Audit events (" + list.length + ")", ["Time", "Action", "Entity", "Before", "After"], list.map(function (e) { return "<tr><td>" + esc(e.at) + "</td><td>" + esc(e.action) + "</td><td><code>" + esc(e.entity) + '</code></td><td class="ad-mono">' + esc(JSON.stringify(e.before)) + '</td><td class="ad-mono">' + esc(JSON.stringify(e.after)) + "</td></tr>"; })) : empty("No audit events", "Drafts, review states and moderation marks create events here."));
    });
  };
  V.system = function () {
    return svc.adapterInfo().then(function (info) {
      adapterInfo = info;
      return table("System", ["Item", "Value", "Detail"], svc.system(info).map(function (s) { return "<tr><th scope=\"row\">" + esc(s.key) + "</th><td>" + statusBadge(s.value) + "</td><td>" + esc(s.detail) + "</td></tr>"; })) +
        (info.problems && info.problems.length ? '<div class="ad-callout ad-callout--warn">Storage notes: ' + esc(info.problems.join(", ")) + " (malformed local state is ignored, never trusted)</div>" : "") +
        '<p class="ad-note">Status words are defined once in admin-service.js (STATUS). <a href="/livon/admin/data/">Open the Data Manager</a></p>';
    });
  };
  function future(m) { return function () { return '<div class="ad-callout ad-callout--gap">' + badge("BACKEND REQUIRED", "gap") + " <strong>" + esc(m.label) + "</strong> needs " + esc(m.requires) + ". Nothing is shown here until it exists — no sample data, no statistics.</div>" + '<section class="ad-card"><h2>Planned management</h2><ul>' + m.manages.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>"; }; }
  LivonAdminService.FUTURE_MODULES.forEach(function (m) { V[m.id] = future(m); });

  /* ───────── shell ───────── */
  function shell() {
    var nav = svc.NAV.map(function (n) { return '<li><a href="#' + n.id + '" data-ad-nav="' + n.id + '">' + esc(n.label) + "</a></li>"; }).join("");
    var fut = svc.FUTURE_MODULES.map(function (m) { return '<li><a href="#' + m.id + '" data-ad-nav="' + m.id + '"><span>' + esc(m.label) + "</span>" + badge("backend", "gap") + "</a></li>"; }).join("");
    app.innerHTML = '<div class="ad-shell"><aside class="ad-side" aria-label="Admin navigation"><p class="ad-brand">LIVON Admin</p><p class="ad-badges">' + badge("LOCAL", "ok") + badge("PROTOTYPE", "warn") + badge("READ-ONLY DATA") + "</p>" +
      '<nav aria-label="Admin sections"><ul class="ad-nav">' + nav + '</ul><p class="ad-nav-group" id="ad-future-h">Future (backend required)</p><ul class="ad-nav ad-nav--future" aria-labelledby="ad-future-h">' + fut + '</ul><p class="ad-nav-group">Tools</p><ul class="ad-nav"><li><a href="/livon/admin/data/">Data Manager ↗</a></li></ul></nav></aside>' +
      '<header class="ad-top"><div class="ad-gsearch"><label class="ad-sr" for="ad-gq">Search the Admin</label><input id="ad-gq" type="search" role="combobox" aria-expanded="false" aria-controls="ad-gres" aria-autocomplete="list" autocomplete="off" placeholder="Search content, life stages, events, sources, providers, issues…"><ul id="ad-gres" class="ad-results" role="listbox" aria-label="Search results" hidden></ul></div>' +
      '<button type="button" class="ad-btn ad-btn--ghost" data-ad-palette aria-keyshortcuts="Control+K Meta+K">Commands <kbd>Ctrl/⌘ K</kbd></button><span class="ad-note" data-ad-storage></span></header>' +
      '<main id="ad-main" class="ad-main" tabindex="-1"><div class="ad-head"><h1 data-ad-title></h1></div><div data-ad-view></div></main></div>' +
      '<dialog id="ad-palette" class="ad-palette" aria-label="Command palette"><div class="ad-palette__in"><label class="ad-sr" for="ad-pq">Command or record</label><input id="ad-pq" type="text" role="combobox" aria-expanded="true" aria-controls="ad-plist" autocomplete="off" placeholder="Go to…, Open…, or a record title"></div><ul id="ad-plist" role="listbox" aria-label="Commands"></ul></dialog>';
    app.setAttribute("data-ad-state", "ready");
  }
  function titleFor(view) {
    var n = svc.NAV.concat(svc.FUTURE_MODULES).filter(function (x) { return x.id === view; })[0];
    return n ? n.label : view === "record" ? "Record" : view === "provider" ? "Provider" : "Not found";
  }
  function render(focus) {
    var h = location.hash.replace(/^#/, "") || "overview";
    var i = h.indexOf("/"), view = i < 0 ? h : h.slice(0, i), param = i < 0 ? "" : h.slice(i + 1);
    var fn = V[view], seq = ++renderSeq, host = app.querySelector("[data-ad-view]");
    app.querySelector("[data-ad-title]").textContent = titleFor(view);
    document.title = titleFor(view) + " · LIVON Admin";
    var navId = view === "record" ? "content" : view === "provider" ? "providers" : view;
    app.querySelectorAll("[data-ad-nav]").forEach(function (a) { if (a.getAttribute("data-ad-nav") === navId) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    var active = document.activeElement && document.activeElement.id;
    Promise.resolve().then(function () { if (!fn) return '<div class="ad-callout ad-callout--bad"><strong>Unknown page:</strong> <code>#' + esc(h) + '</code>. <a href="#overview">Go to Overview</a></div>'; return fn(param); })
      .catch(function (e) { return '<div class="ad-callout ad-callout--bad"><strong>This view could not be built:</strong> ' + esc(e && e.message) + ". The rest of the Admin keeps working.</div>"; })
      .then(function (html) {
        if (seq !== renderSeq) return;
        host.innerHTML = html || "";
        host.setAttribute("data-ad-current", view);
        if (focus) app.querySelector("#ad-main").focus();
        else if (active && document.getElementById(active) && host.contains(document.getElementById(active))) { var el = document.getElementById(active); el.focus(); if (el.type === "search" && el.setSelectionRange) el.setSelectionRange(el.value.length, el.value.length); }
      });
  }
  var lastView = "";
  function route() { var v = (location.hash.replace(/^#/, "") || "overview").split("/")[0]; var changed = v !== lastView; lastView = v; render(changed); }
  function saveContentState() { svc.setUiState("content", content); }

  /* ───────── global search ───────── */
  var gsel = -1, gitems = [];
  function gRender(q) {
    var list = document.getElementById("ad-gres"), input = document.getElementById("ad-gq");
    gitems = svc.globalSearch(q, 30); gsel = gitems.length ? 0 : -1;
    if (!q.trim()) { list.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
    list.innerHTML = gitems.length ? gitems.map(function (g, i) { return '<li role="option" id="ad-g-' + i + '" data-ad-go="' + esc(g.route) + '"' + (i === gsel ? ' aria-selected="true"' : "") + '><span class="k">' + esc(g.kind) + '</span><span class="l">' + esc(g.label) + ' <span class="ad-note">' + esc(g.sub) + "</span></span></li>"; }).join("") : '<li role="option" aria-disabled="true"><span class="k">—</span><span class="l">No match</span></li>';
    list.hidden = false; input.setAttribute("aria-expanded", "true"); input.setAttribute("aria-activedescendant", gitems.length ? "ad-g-0" : "");
  }
  function gMove(d) {
    if (!gitems.length) return; gsel = (gsel + d + gitems.length) % gitems.length;
    document.querySelectorAll("#ad-gres li").forEach(function (li, i) { li.setAttribute("aria-selected", i === gsel ? "true" : "false"); if (i === gsel) li.scrollIntoView({ block: "nearest" }); });
    document.getElementById("ad-gq").setAttribute("aria-activedescendant", "ad-g-" + gsel);
  }
  function go(route) {
    document.getElementById("ad-gres").hidden = true; document.getElementById("ad-gq").setAttribute("aria-expanded", "false");
    if (/^#/.test(route)) location.hash = route; else location.href = route;
  }

  /* ───────── command palette ───────── */
  var pitems = [], psel = 0, paletteOpener = null;
  function pRender(q) {
    var w = String(q || "").toLowerCase().trim();
    var cmds = svc.commands().filter(function (c) { return !w || c.label.toLowerCase().indexOf(w) >= 0; }).map(function (c) { return { label: c.label, route: c.route, kind: "command" }; });
    var recs = w.length >= 2 ? svc.globalSearch(w, 8).map(function (g) { return { label: g.label, route: g.route, kind: g.kind }; }) : [];
    pitems = cmds.concat(recs).slice(0, 30); psel = 0;
    document.getElementById("ad-plist").innerHTML = pitems.length ? pitems.map(function (p, i) { return '<li role="option" id="ad-p-' + i + '" data-ad-pgo="' + i + '"' + (i === 0 ? ' aria-selected="true"' : "") + "><span>" + esc(p.label) + "</span><span>" + esc(p.kind) + "</span></li>"; }).join("") : '<li role="option" aria-disabled="true"><span>No command or record matches</span><span></span></li>';
    document.getElementById("ad-pq").setAttribute("aria-activedescendant", pitems.length ? "ad-p-0" : "");
  }
  function pMove(d) { if (!pitems.length) return; psel = (psel + d + pitems.length) % pitems.length; document.querySelectorAll("#ad-plist li").forEach(function (li, i) { li.setAttribute("aria-selected", i === psel ? "true" : "false"); if (i === psel) li.scrollIntoView({ block: "nearest" }); }); document.getElementById("ad-pq").setAttribute("aria-activedescendant", "ad-p-" + psel); }
  function openPalette() { var d = document.getElementById("ad-palette"); if (d.open) return; paletteOpener = document.activeElement; d.showModal(); var i = document.getElementById("ad-pq"); i.value = ""; pRender(""); i.focus(); }
  function closePalette(route) { var d = document.getElementById("ad-palette"); if (d.open) d.close(); if (route) go(route); else if (paletteOpener && document.contains(paletteOpener)) paletteOpener.focus(); }

  /* ───────── events ───────── */
  var cqTimer = null;
  function onInput(e) {
    var t = e.target;
    if (t.id === "ad-gq") gRender(t.value);
    else if (t.id === "ad-pq") pRender(t.value);
    else if (t.hasAttribute("data-ad-cq")) { clearTimeout(cqTimer); cqTimer = setTimeout(function () { content.q = t.value; content.page = 1; saveContentState(); render(); }, 120); }
  }
  function onChange(e) {
    var t = e.target;
    if (t.hasAttribute("data-ad-cf")) { content.filters[t.getAttribute("data-name")] = t.value; content.page = 1; saveContentState(); render(); }
    else if (t.hasAttribute("data-ad-sort")) { content.sort = t.value; saveContentState(); render(); }
    else if (t.hasAttribute("data-ad-dir")) { content.dir = t.value; saveContentState(); render(); }
    else if (t.hasAttribute("data-ad-rp")) { local.reviewP = t.value; svc.setUiState("review", { p: local.reviewP, s: local.reviewState }); render(); }
    else if (t.hasAttribute("data-ad-rs")) { local.reviewState = t.value; svc.setUiState("review", { p: local.reviewP, s: local.reviewState }); render(); }
    else if (t.hasAttribute("data-ad-lef")) { local.leFilter = t.value; svc.setUiState("lifeEvents", { f: local.leFilter }); render(); }
    else if (t.hasAttribute("data-ad-istate")) { svc.setReviewState(t.getAttribute("data-ad-istate"), t.value).then(function () { render(); }); }
    else if (t.hasAttribute("data-ad-mod")) { svc.setModeration(t.getAttribute("data-ad-mod"), t.value || null).then(function () { render(); }); }
  }
  function onClick(e) {
    var li = e.target.closest("[data-ad-go]"); if (li) { go(li.getAttribute("data-ad-go")); return; }
    var pli = e.target.closest("[data-ad-pgo]"); if (pli) { var p = pitems[+pli.getAttribute("data-ad-pgo")]; closePalette(p && p.route); return; }
    var b = e.target.closest("button"); if (!b) { if (!e.target.closest(".ad-gsearch")) { var r = document.getElementById("ad-gres"); if (r) r.hidden = true; } return; }
    if (b.hasAttribute("data-ad-palette")) openPalette();
    else if (b.hasAttribute("data-ad-page")) { content.page = +b.getAttribute("data-ad-page"); saveContentState(); render(); }
    else if (b.hasAttribute("data-ad-creset")) { content = { q: "", filters: {}, sort: "id", dir: "asc", page: 1 }; saveContentState(); render(); }
    else if (b.hasAttribute("data-ad-goflag")) { content = { q: "", filters: { flag: b.getAttribute("data-ad-goflag") }, sort: "id", dir: "asc", page: 1 }; saveContentState(); location.hash = "#content"; }
    else if (b.hasAttribute("data-ad-dstatus")) { svc.setDraftStatus(b.getAttribute("data-id"), b.getAttribute("data-ad-dstatus")).then(function () { render(); }, function (err) { local.flash = '<p class="ad-err">' + esc(err.code || err.message) + "</p>"; render(); }); }
    else if (b.hasAttribute("data-ad-ddiscard")) { svc.discardDraft(b.getAttribute("data-ad-ddiscard")).then(function () { local.flash = '<p class="ad-note">Draft discarded (local).</p>'; render(); }); }
    else if (b.hasAttribute("data-ad-export")) { exportReport(b.getAttribute("data-ad-export"), b.getAttribute("data-format")); }
  }
  function onSubmit(e) {
    var f = e.target; if (!f.hasAttribute("data-ad-draftform")) return;
    e.preventDefault();
    var input = { title: f.title.value, summary: f.summary.value, category: f.category.value, tags: f.tags.value, cta: f.cta.value };
    svc.saveDraft(f.getAttribute("data-id"), input).then(function () { local.flash = '<p class="ad-note">' + badge("LOCAL DRAFT", "draft") + " saved in this browser. Nothing was changed on LIVON.</p>"; render(); },
      function (err) {
        var msg = err.code === "VALIDATION_FAILED" ? err.errors.map(function (x) { return x.field + ": " + x.message; }).join(" · ") : err.code === "NO_CHANGES" ? "No field was changed." : (err.code || err.message);
        var box = app.querySelector("[data-ad-draftmsg]"); if (box) box.innerHTML = '<p class="ad-err">' + esc(msg) + "</p>";
      });
  }
  function onKey(e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openPalette(); return; }
    var t = e.target;
    if (t.id === "ad-gq") {
      if (e.key === "ArrowDown") { e.preventDefault(); gMove(1); } else if (e.key === "ArrowUp") { e.preventDefault(); gMove(-1); }
      else if (e.key === "Enter" && gitems[gsel]) { e.preventDefault(); go(gitems[gsel].route); }
      else if (e.key === "Escape") { document.getElementById("ad-gres").hidden = true; t.setAttribute("aria-expanded", "false"); }
    } else if (t.id === "ad-pq") {
      if (e.key === "ArrowDown") { e.preventDefault(); pMove(1); } else if (e.key === "ArrowUp") { e.preventDefault(); pMove(-1); }
      else if (e.key === "Enter") { e.preventDefault(); var p = pitems[psel]; closePalette(p && p.route); }
    }
  }
  function exportReport(id, format) {
    svc.reviewStates().then(function (states) {
      var text = svc.exportReport(id, format, states); if (!text) return;
      var blob = new Blob([text], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "livon-admin-" + id + "-" + new Date().toISOString().slice(0, 10) + "." + format; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ───────── boot ───────── */
  function safe(name) { try { return window[name]; } catch (e) { return null; } }
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("failed to load " + src)); }; document.body.appendChild(s); }); }
  var manifestPromise = import("/server/livon/data/manifest.mjs").then(function (m) { return m; }, function () { return null; });
  DM.DATA_SCRIPTS.reduce(function (p, src) { return p.then(function () { return loadScript(src); }); }, Promise.resolve())
    .then(function () { return window.LivonLifeHub.repo.load(); })
    .then(function () { return manifestPromise; })
    .then(function (manifest) {
      var adapter = LivonAdminStore.createLocalAdapter({ localStorage: safe("localStorage"), sessionStorage: safe("sessionStorage") });
      svc = LivonAdminService.create({ env: window, adapter: adapter, manifest: manifest, host: location.hostname });
      window.__livonAdmin = svc; /* local debugging */
      return Promise.all([svc.uiState("content"), svc.uiState("review"), svc.uiState("lifeEvents"), svc.adapterInfo()]);
    })
    .then(function (st) {
      if (st[0] && typeof st[0] === "object") content = { q: String(st[0].q || ""), filters: st[0].filters && typeof st[0].filters === "object" ? st[0].filters : {}, sort: st[0].sort || "id", dir: st[0].dir === "desc" ? "desc" : "asc", page: +st[0].page || 1 };
      if (st[1]) { local.reviewP = st[1].p || ""; local.reviewState = st[1].s || ""; }
      if (st[2]) local.leFilter = st[2].f || "";
      adapterInfo = st[3] || {};
      shell();
      var note = app.querySelector("[data-ad-storage]"); if (note) note.textContent = adapterInfo.persistent ? "local state: this browser" : "local state: memory only (storage blocked)";
      app.addEventListener("input", onInput); app.addEventListener("change", onChange); app.addEventListener("click", onClick); app.addEventListener("submit", onSubmit);
      document.addEventListener("keydown", onKey);
      document.getElementById("ad-palette").addEventListener("close", function () { if (paletteOpener && document.contains(paletteOpener) && document.activeElement === document.body) paletteOpener.focus(); });
      window.addEventListener("hashchange", route);
      route();
    })
    .catch(function (err) {
      app.setAttribute("data-ad-state", "error");
      app.innerHTML = '<main class="ad-unavailable"><h1>Could not start the Admin</h1><p>' + esc(err && err.message) + "</p><p>Serve the repository root locally: <code>node scripts/livon-data-manager.mjs</code> then open /livon/admin/</p></main>";
    });
})();
