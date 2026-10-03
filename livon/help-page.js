/*
 * LIVON Help Center — Help Home · categories (FAQ) · articles · search · troubleshooting · service status.
 *
 *   content   livon/help-data.js (bundled with the page: works offline, nothing is fetched)
 *   routes    #help · #help/c/{categoryId} · #help/a/{articleId} · #help/search?q=… · #help/status
 *   routing   The page's inline router (index.html) knows seven views and treats any other hash as Home. Help adds its own
 *             view on top of it: route() runs right after the inline router on every hash change and, for a #help… hash,
 *             switches the page to data-lv-view="help". The inline script is left untouched, so the CSP hashes that pin
 *             it stay valid.
 *   search    runs in the browser over the bundled articles. The query is never sent anywhere and is not stored.
 *   support   there is no inquiry / ticket backend: Help never offers a "send" action (facts.support = NOT_CONNECTED)
 *
 * Other screens link here with <a href="#help/a/{id}" data-lv-help-link> (contextual help).
 */
(function () {
  "use strict";
  var D = window.LivonHelpData;
  if (!D) return;
  var BASE_TITLE = document.title || "LIVON";
  var byId = Object.create(null), catById = Object.create(null);   /* no inherited keys: "__proto__" is not an article */
  D.articles.forEach(function (a) { byId[a.id] = a; });
  D.categories.forEach(function (c) { catById[c.id] = c; });

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* numbers in article text come from facts (checked against the code by the tests) */
  function fill(s) { return String(s == null ? "" : s).replace(/\{(\w+)\}/g, function (m, k) { return D.facts[k] != null ? String(D.facts[k]) : m; }); }
  function reducedMotion() { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }

  /* ───────── search ───────── */
  function norm(s) {
    s = String(s == null ? "" : s);
    try { s = s.normalize("NFC"); } catch (e) {}
    return s.toLowerCase().replace(/[?!.,·…“”"'‘’()\[\]]/g, " ").replace(/\s+/g, " ").trim();
  }
  function tight(s) { return norm(s).replace(/ /g, ""); }
  /* question words and endings that carry no topic */
  var STOP = ["왜", "어떻게", "무엇", "뭐", "뭔가요", "어디", "어디서", "언제", "인가요", "있나요", "하나요", "되나요", "해요", "돼요", "좀", "것", "수", "알려줘", "알려주세요", "방법", "관련"];
  /* "it does not work" words: not a topic, but they point to troubleshooting */
  var TROUBLE = ["안", "안돼요", "안됨", "안되요", "안돼", "않아요", "오류", "에러", "문제", "고장", "못", "없어요", "안떠요", "안열려요", "안보여요", "사라졌어요", "없어졌어요"];
  var ENDINGS = /(이에요|예요|인가요|이요|에서|으로|했어요|했는데|되나요|하나요|있나요|없어요|어요|아요|해요|돼요|하기|이|가|은|는|을|를|에|의|도|로|요)$/;
  var index = null, synonymOf = null;
  function buildIndex() {
    if (index) return index;
    synonymOf = {};
    D.synonyms.forEach(function (group) {
      var terms = group.map(tight).filter(Boolean);
      terms.forEach(function (t) { synonymOf[t] = (synonymOf[t] || []).concat(terms.filter(function (x) { return x !== t; })); });
    });
    index = D.articles.map(function (a) {
      var cat = catById[a.cat] || {}, ts = a.ts || {};
      var body = [].concat(a.body || [], a.steps || [], a.note || "", ts.symptom || "", ts.causes || [], ts.fixes || []).map(fill).join(" ");
      return { a: a, title: tight(fill(a.title)), kw: (a.kw || []).map(tight), short: tight(fill(a.short)), body: tight(body),
        cat: tight(cat.label || ""), feature: tight((a.feature || [])[0] || "") };
    });
    return index;
  }
  function tokensOf(q) {
    var raw = norm(q).split(" ").filter(Boolean), topic = [], trouble = false;
    raw.forEach(function (t) {
      if (TROUBLE.indexOf(t) >= 0) { trouble = true; return; }
      if (STOP.indexOf(t) >= 0) return;
      if (t.length < 2 && !/[a-z0-9]/.test(t)) return;
      topic.push(t);
    });
    return { topic: topic, trouble: trouble };
  }
  function variants(t) {
    var out = [t], stem = t.replace(ENDINGS, "");
    if (stem !== t && stem.length >= 2) out.push(stem);
    return out;
  }
  function fieldScore(e, term) {
    if (e.title.indexOf(term) >= 0) return 10;
    if (e.kw.some(function (k) { return k.indexOf(term) >= 0 || (k.length >= 2 && term.indexOf(k) >= 0); })) return 8;
    if (e.cat.indexOf(term) >= 0) return 4;
    if (e.short.indexOf(term) >= 0) return 4;
    if (e.feature.indexOf(term) >= 0) return 3;
    if (e.body.indexOf(term) >= 0) return 2;
    return 0;
  }
  function synonymsFor(term) {
    var out = [];
    Object.keys(synonymOf).forEach(function (k) { if (k === term || (term.length >= 2 && k.indexOf(term) === 0 && k.length - term.length <= 1)) out = out.concat(synonymOf[k]); });
    return out;
  }
  /* search(q) → { query, items:[{ article, score, via }], partial, suggestions[] } — best match first */
  function search(q, noSuggest) {
    buildIndex();
    q = String(q == null ? "" : q).slice(0, 80);
    var whole = tight(q), tk = tokensOf(q), out = { query: norm(q), items: [], partial: false, suggestions: [] };
    if (!whole) return out;
    var tokens = tk.topic.length ? tk.topic : [whole];
    var scored = index.map(function (e) {
      var s = 0, hit = 0, via = "";
      if (e.title.indexOf(whole) >= 0) s += 40;
      else if (e.kw.some(function (k) { return k === whole; })) s += 34;
      else if (e.kw.some(function (k) { return k.indexOf(whole) >= 0; })) s += 26;
      else if (e.short.indexOf(whole) >= 0) s += 12;
      else if (e.body.indexOf(whole) >= 0) s += 6;
      tokens.forEach(function (t) {
        var best = 0;
        variants(t).forEach(function (v) { best = Math.max(best, fieldScore(e, v)); });
        if (!best) {
          var syn = 0;
          variants(t).forEach(function (v) { synonymsFor(v).forEach(function (x) { syn = Math.max(syn, fieldScore(e, x)); }); });
          if (syn) { best = syn * 0.5; via = via || "synonym"; }
        }
        if (best) { hit++; s += best; }
      });
      if (s && tk.trouble && e.a.cat === "troubleshooting") s += 6;
      if (s && e.a.popular) s += 0.5;
      return { article: e.a, score: s, hit: hit, via: via };
    }).filter(function (x) { return x.score > 0; });
    var full = scored.filter(function (x) { return x.hit === tokens.length || x.score >= 26; });
    var list = full.length ? full : scored;
    out.partial = !full.length && scored.length > 0;
    list.sort(function (a, b) { return b.score - a.score || b.hit - a.hit || String(a.article.title).localeCompare(String(b.article.title)); });
    out.items = list.slice(0, 20).map(function (x) { return { article: x.article, score: x.score, via: x.via }; });
    if (!out.items.length && !noSuggest) out.suggestions = suggest(tokens);
    return out;
  }
  /* other words the reader could try: real synonyms and category names only — never a made-up article */
  function suggest(tokens) {
    var seen = {}, out = [];
    tokens.forEach(function (t) {
      variants(t).forEach(function (v) {
        D.synonyms.forEach(function (g) {
          if (g.some(function (x) { return tight(x) === v; })) g.forEach(function (x) { if (tight(x) !== v && !seen[x] && search(x, true).items.length) { seen[x] = 1; out.push(x); } });
        });
      });
    });
    return out.slice(0, 5);
  }

  /* ───────── routes ───────── */
  function parse(hash) {
    var h = String(hash || "").replace(/^#/, ""), q = "", i = h.indexOf("?");
    if (i >= 0) { q = h.slice(i + 1); h = h.slice(0, i); }
    var params = {};
    q.split("&").forEach(function (p) {
      if (!p) return;
      var kv = p.split("=");
      try { params[decodeURIComponent(kv[0])] = decodeURIComponent((kv.slice(1).join("=") || "").replace(/\+/g, " ")); } catch (e) {}
    });
    var parts = h.split("/");
    if (parts[0] !== "help") return { view: "notfound" };
    if (parts.length === 1 || (parts.length === 2 && !parts[1])) return { view: "home" };
    if (parts[1] === "search" && parts.length === 2) return { view: "search", q: String(params.q || "").slice(0, 80) };
    if (parts[1] === "status" && parts.length === 2) return { view: "status" };
    if (parts[1] === "troubleshooting" && parts.length === 2) return { view: "category", id: "troubleshooting" };
    if (parts[1] === "c" && parts.length === 3 && catById[parts[2]]) return { view: "category", id: parts[2] };
    if (parts[1] === "a" && parts.length === 3 && byId[parts[2]]) return { view: "article", id: parts[2] };
    return { view: "notfound" };
  }
  function hrefOf(a) { return "#help/a/" + a.id; }
  function articlesIn(catId) { return D.articles.filter(function (a) { return a.cat === catId; }); }

  /* ───────── pieces ───────── */
  function searchForm(q, big) {
    return '<form class="lv-hp-search' + (big ? " lv-hp-search--lg" : "") + '" role="search" aria-label="도움말 검색" data-lv-hp-search>' +
      '<label class="visually-hidden" for="lv-hp-q">도움말 검색어</label>' +
      '<input id="lv-hp-q" type="search" name="q" maxlength="80" autocomplete="off" placeholder="예: 저장, 다른 기기, 신고, 추천" value="' + esc(q || "") + '" data-lv-hp-q />' +
      '<button type="submit" class="lv-hp-btn lv-hp-btn--dark">검색</button></form>';
  }
  function crumbs(items, allLinks) {
    return '<nav class="lv-hp-crumbs" aria-label="도움말 위치"><ol>' + items.map(function (x, i) {
      var last = !allLinks && i === items.length - 1;
      return "<li>" + (x[1] && !last ? '<a href="' + esc(x[1]) + '">' + esc(x[0]) + "</a>" : '<span aria-current="page">' + esc(x[0]) + "</span>") + "</li>";
    }).join("") + "</ol></nav>";
  }
  function articleLinks(list, withShort) {
    return '<ul class="lv-hp-list">' + list.map(function (a) {
      return '<li><a href="' + hrefOf(a) + '" data-lv-hp-result><strong>' + esc(fill(a.title)) + "</strong>" +
        (withShort ? "<span>" + esc(fill(a.short)) + "</span>" : "") + "<small>" + esc((catById[a.cat] || {}).label || "") + "</small></a></li>";
    }).join("") + "</ul>";
  }
  /* Public data is the one row whose truth depends on the deployment: a build with a data server origin may receive
     public data. The row then says what THIS browser has actually received (LivonData.status()), never what is merely
     configured. Without received data it stays exactly as written in help-data.js. */
  function liveDataNow() {
    var L = window.LivonData, st = null;
    try { st = L && typeof L.status === "function" ? L.status() : null; } catch (e) { st = null; }
    var names = [];
    ((st && st.providers) || []).forEach(function (p) {
      if (p && !p.builtin && p.requiresServer && p.status === "active" && p.name && names.indexOf(p.name) < 0) names.push(p.name);
    });
    return names;
  }
  function statusNow(s) {
    if (s.id !== "live-data") return { state: s.state, label: D.statusLabel[s.state] || "", text: s.text };
    var names = liveDataNow();
    if (!names.length) return { state: s.state, label: D.statusLabel[s.state] || "", text: s.text };
    return { state: "available", label: "일부 연결됨",
      text: "지금 이 브라우저에서 받아 온 공공 데이터가 있어요: " + names.join(", ") + ". 그 밖의 영역은 정리해 둔 안내와 공식 링크를 보여 줘요." };
  }
  function statusRows(list) {
    return '<ul class="lv-hp-status">' + list.map(function (s0) {
      var now = statusNow(s0), s = { label: s0.label, article: s0.article, state: now.state, text: now.text };
      return '<li><div class="lv-hp-status__head"><strong>' + esc(s.label) + '</strong><span class="lv-hp-badge lv-hp-badge--' + esc(s.state) + '"' + (s0.id === "live-data" ? " data-lv-hp-live" : "") + ">" + esc(now.label) + "</span></div>" +
        "<p>" + esc(fill(s.text)) + ' <a href="#help/a/' + esc(s.article) + '">자세히<span class="visually-hidden">: ' + esc(s.label) + "</span></a></p></li>";
    }).join("") + "</ul>";
  }
  function footNav(extra) {
    return '<nav class="lv-hp-foot" aria-label="도움말 이동">' + (extra || "") +
      '<a class="lv-hp-btn" href="#help">도움말 홈</a><a class="lv-hp-btn" href="#help/c/troubleshooting">문제 해결</a><a class="lv-hp-btn" href="#help/status">서비스 상태</a></nav>';
  }
  var SUPPORT_NOTE = '<p class="lv-hp-note">문의를 보내는 기능은 아직 연결되지 않았어요. 도움말은 이 기기 안에서 동작하며, 검색어는 어디에도 전송되지 않아요.</p>';

  /* ───────── views ───────── */
  function viewHome() {
    var popular = D.articles.filter(function (a) { return a.popular && a.cat !== "troubleshooting"; }).slice(0, 8);
    var trouble = articlesIn("troubleshooting").slice(0, 6);
    return '<header class="lv-hp-head"><p class="lv-hp-eyebrow">Help</p><h1 class="lv-hp-title" id="lv-hp-h" tabindex="-1">무엇을 도와드릴까요?</h1>' +
      '<p class="lv-hp-lead">LIVON을 쓰다가 궁금하거나 막히는 부분을 여기서 찾아보세요. 지금 실제로 되는 기능만 설명해요.</p></header>' +
      searchForm("", true) +
      '<section class="lv-hp-sec" aria-labelledby="lv-hp-cats"><h2 id="lv-hp-cats">주제별로 찾기</h2><ul class="lv-hp-cats">' + D.categories.map(function (c) {
        return '<li><a href="#help/c/' + esc(c.id) + '"><strong>' + esc(c.label) + "</strong><span>" + esc(c.desc) + "</span><small>도움말 " + articlesIn(c.id).length + "개</small></a></li>";
      }).join("") + "</ul></section>" +
      '<section class="lv-hp-sec" aria-labelledby="lv-hp-pop"><h2 id="lv-hp-pop">자주 찾는 도움말</h2>' + articleLinks(popular, false) + "</section>" +
      '<section class="lv-hp-sec" aria-labelledby="lv-hp-ts"><h2 id="lv-hp-ts">문제 해결</h2><p class="lv-hp-lead">증상을 고르면 이유와 해결 방법을 볼 수 있어요.</p>' + articleLinks(trouble, false) +
        '<p><a class="lv-hp-btn" href="#help/c/troubleshooting">문제 해결 전체 보기</a></p></section>' +
      '<section class="lv-hp-sec" aria-labelledby="lv-hp-st"><h2 id="lv-hp-st">서비스 상태</h2><p class="lv-hp-lead">지금 쓸 수 있는 기능과 아직 연결되지 않은 기능이에요.</p>' +
        statusRows(D.status.filter(function (s) { return ["core", "community", "follow", "ai", "account"].indexOf(s.id) >= 0; })) +
        '<p><a class="lv-hp-btn" href="#help/status">서비스 상태 전체 보기</a></p></section>' + SUPPORT_NOTE;
  }
  function viewCategory(id) {
    var c = catById[id], list = articlesIn(id);
    return crumbs([["도움말", "#help"], [c.label, ""]]) +
      '<header class="lv-hp-head"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">' + esc(c.label) + '</h1><p class="lv-hp-lead">' + esc(c.desc) + " · 도움말 " + list.length + "개</p></header>" +
      searchForm("", false) +
      '<div class="lv-hp-faq">' + list.map(function (a, i) {
        var pid = "lv-hp-p-" + esc(a.id), bid = "lv-hp-b-" + esc(a.id), open = i === 0;
        return '<div class="lv-hp-faq__item"><h2 class="lv-hp-faq__q"><button type="button" id="' + bid + '" aria-expanded="' + open + '" aria-controls="' + pid + '" data-lv-hp-toggle>' + esc(fill(a.title)) + "</button></h2>" +
          '<div class="lv-hp-faq__a" id="' + pid + '" role="region" aria-labelledby="' + bid + '"' + (open ? "" : " hidden") + "><p>" + esc(fill(a.short)) + '</p><p><a href="' + hrefOf(a) + '">자세히 보기<span class="visually-hidden">: ' + esc(fill(a.title)) + "</span></a></p></div></div>";
      }).join("") + "</div>" + footNav("");
  }
  function viewArticle(id) {
    var a = byId[id], c = catById[a.cat] || { label: "", id: "" }, ts = a.ts;
    var related = (a.related || []).map(function (r) { return byId[r]; }).filter(Boolean);
    var list = function (title, items, ordered) {
      if (!items || !items.length) return "";
      var tag = ordered ? "ol" : "ul";
      return '<section class="lv-hp-block"><h2>' + esc(title) + "</h2><" + tag + ">" + items.map(function (x) { return "<li>" + esc(fill(x)) + "</li>"; }).join("") + "</" + tag + "></section>";
    };
    return crumbs([["도움말", "#help"], [c.label, "#help/c/" + c.id]], true) +   /* the title follows as the h1: it is not repeated in the trail */
      '<article class="lv-hp-article" aria-labelledby="lv-hp-h"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">' + esc(fill(a.title)) + "</h1>" +
        '<p class="lv-hp-answer">' + esc(fill(a.short)) + "</p>" +
        (ts ? '<section class="lv-hp-block"><h2>증상</h2><p>' + esc(fill(ts.symptom)) + "</p></section>" + list("가능한 이유", ts.causes, false) + list("해결 방법", ts.fixes, true) : "") +
        (a.body || []).map(function (p) { return "<p>" + esc(fill(p)) + "</p>"; }).join("") +
        list("이렇게 해 보세요", a.steps, true) +
        (a.note ? '<p class="lv-hp-callout"><strong>알아 두세요</strong> ' + esc(fill(a.note)) + "</p>" : "") +
        (a.feature ? '<p class="lv-hp-feature"><a class="lv-hp-btn lv-hp-btn--dark" href="' + esc(a.feature[1]) + '">' + esc(a.feature[0]) + " 열기</a></p>" : "") +
      "</article>" +
      (related.length ? '<section class="lv-hp-sec" aria-labelledby="lv-hp-rel"><h2 id="lv-hp-rel">관련 도움말</h2>' + articleLinks(related, false) + "</section>" : "") +
      footNav('<a class="lv-hp-btn" href="#help/c/' + esc(c.id) + '">← ' + esc(c.label) + "</a>");
  }
  function viewSearch(q) {
    var r = search(q), n = r.items.length;
    var head = crumbs([["도움말", "#help"], ["검색", ""]]) +
      '<header class="lv-hp-head"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">' + (r.query ? "‘" + esc(q) + "’ 검색 결과 " + n + "개" : "도움말 검색") + "</h1></header>" + searchForm(q, false);
    if (!r.query) return head + '<p class="lv-hp-lead">찾고 싶은 내용을 한두 단어로 입력해 주세요.</p>' + footNav("");
    if (!n) {
      return head + '<div class="lv-hp-empty"><h2>맞는 도움말을 찾지 못했어요</h2><ul><li>검색어를 한두 단어로 줄여 보세요. 예: ‘저장’, ‘신고’</li><li>띄어쓰기나 맞춤법을 확인해 주세요.</li></ul>' +
        (r.suggestions.length ? '<p>이렇게 찾아볼 수도 있어요</p><p class="lv-hp-chips">' + r.suggestions.map(function (s) { return '<a href="#help/search?q=' + encodeURIComponent(s) + '">' + esc(s) + "</a>"; }).join("") + "</p>" : "") +
        "<p>주제별로 둘러보기</p><p class=\"lv-hp-chips\">" + D.categories.map(function (c) { return '<a href="#help/c/' + esc(c.id) + '">' + esc(c.label) + "</a>"; }).join("") + "</p></div>" + SUPPORT_NOTE + footNav("");
    }
    return head + (r.partial ? '<p class="lv-hp-lead">검색어 전체와 맞는 도움말은 없어서, 일부 단어와 맞는 도움말을 보여드려요.</p>' : "") +
      articleLinks(r.items.map(function (x) { return x.article; }), true) + footNav("");
  }
  function viewStatus() {
    return crumbs([["도움말", "#help"], ["서비스 상태", ""]]) +
      '<header class="lv-hp-head"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">서비스 상태</h1>' +
      '<p class="lv-hp-lead">지금 버전에서 쓸 수 있는 기능과 아직 연결되지 않은 기능이에요. 실시간 점검 결과가 아니라 현재 구성 안내예요. 공공 데이터 항목만 이 브라우저가 실제로 받아 온 내용을 기준으로 표시해요.</p></header>' +
      statusRows(D.status) + footNav("");
  }
  function viewNotFound() {
    return crumbs([["도움말", "#help"], ["찾을 수 없음", ""]]) +
      '<header class="lv-hp-head"><h1 class="lv-hp-title lv-hp-title--md" id="lv-hp-h" tabindex="-1">도움말을 찾을 수 없어요</h1>' +
      '<p class="lv-hp-lead">주소가 바뀌었거나 없는 도움말이에요. 검색하거나 주제별로 찾아보세요.</p></header>' + searchForm("", false) +
      '<p class="lv-hp-chips">' + D.categories.map(function (c) { return '<a href="#help/c/' + esc(c.id) + '">' + esc(c.label) + "</a>"; }).join("") + "</p>" + footNav("");
  }

  /* ───────── render ───────── */
  var current = { view: "", id: "", q: "" };
  function announce(msg) { var n = $("[data-lv-hp-status]"); if (n) n.textContent = msg || ""; }
  function titleOf(r) {
    if (r.view === "article") return fill(byId[r.id].title) + " · 도움말 · LIVON";
    if (r.view === "category") return catById[r.id].label + " · 도움말 · LIVON";
    if (r.view === "search") return "검색 · 도움말 · LIVON";
    if (r.view === "status") return "서비스 상태 · 도움말 · LIVON";
    return "도움말 · LIVON";
  }
  function render(r) {
    var host = $("[data-lv-hp-root]");
    if (!host) return "";
    var html = r.view === "home" ? viewHome() : r.view === "category" ? viewCategory(r.id) : r.view === "article" ? viewArticle(r.id) :
      r.view === "search" ? viewSearch(r.q) : r.view === "status" ? viewStatus() : viewNotFound();
    host.innerHTML = html;
    host.setAttribute("data-lv-hp-view", r.view);
    current = { view: r.view, id: r.id || "", q: r.q || "" };
    document.title = titleOf(r);
    return html;
  }
  /* opts.initial: the page was loaded on a Help URL — focus stays where a page load puts it (skip link first) */
  function onShow(hash, opts) {
    bind();
    var r = parse(hash);
    render(r);
    if (typeof window.scrollTo === "function") window.scrollTo(0, 0);
    var h = $("#lv-hp-h");
    if (!(opts && opts.initial) && h && typeof h.focus === "function") { try { h.focus({ preventScroll: true }); } catch (e) {} }
    if (r.view === "search" && r.q) announce("‘" + r.q + "’ 검색 결과 " + search(r.q).items.length + "개");
    else if (r.view === "notfound") announce("도움말을 찾을 수 없어요.");
    else announce("");
  }
  function go(hash) { if (location.hash === "#" + hash) onShow(hash); else location.hash = hash; }

  var bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    /* public data arrives after the page: an open status view follows it (no focus change, no scroll) */
    var R = window.LivonData && window.LivonData.repository;
    if (R && typeof R.onChange === "function") R.onChange(function () { if (current.view === "status") render({ view: "status" }); });
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!f || !f.matches || !f.matches("[data-lv-hp-search]")) return;
      e.preventDefault();
      var q = String((f.querySelector("[data-lv-hp-q]") || {}).value || "").replace(/\s+/g, " ").trim().slice(0, 80);
      go(q ? "help/search?q=" + encodeURIComponent(q) : "help/search");
    });
    document.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest("[data-lv-hp-toggle]") : null;
      if (!t) return;
      var open = t.getAttribute("aria-expanded") !== "true";
      t.setAttribute("aria-expanded", String(open));
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !open;
    });
    document.addEventListener("keydown", function (e) {
      if (document.documentElement.dataset.lvView !== "help") return;
      var t = e.target;
      if (!t || !t.closest || !t.closest("#help")) return;
      var input = t.matches && t.matches("[data-lv-hp-q]");
      /* Escape in the search box: clear it; when it is already empty on a result page, go back to Help Home */
      if (e.key === "Escape" && input) {
        if (t.value) { t.value = ""; e.preventDefault(); }
        else if (current.view === "search") { e.preventDefault(); go("help"); }
        return;
      }
      /* Arrow keys move between the search box and the result links */
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      var links = Array.prototype.slice.call(document.querySelectorAll("#help [data-lv-hp-result]"));
      if (!links.length) return;
      var i = links.indexOf(t.closest("[data-lv-hp-result]"));
      if (input && e.key === "ArrowDown") { e.preventDefault(); links[0].focus(); }
      else if (i >= 0) {
        e.preventDefault();
        var next = i + (e.key === "ArrowDown" ? 1 : -1);
        if (next < 0) { var box = $("#help [data-lv-hp-q]"); if (box) box.focus(); }
        else if (next < links.length) links[next].focus();
      }
    });
  }

  /* ───────── routing (see the header comment) ───────── */
  function isHelpHash(h) { return h === "help" || h.indexOf("help/") === 0; }
  function markNav(on) {
    Array.prototype.forEach.call(document.querySelectorAll(".gnav__nav .gnav__link, .gnav-mobile__sublink, #livon-panel-profile a"), function (link) {
      var id = (link.getAttribute("href") || "").split("#")[1] || "";
      if (isHelpHash(id)) { if (on) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current"); }
      else if (on && link.getAttribute("aria-current") === "page" && !link.closest("#livon-panel-profile")) {
        link.removeAttribute("aria-current");
        var group = link.closest(".gnav-dd");
        if (group) group.classList.remove("gnav-dd--active");
      }
    });
  }
  function route(e) {
    var h = (location.hash || "").slice(1), root = document.documentElement;
    if (!isHelpHash(h)) {
      markNav(false);
      if (/도움말 · LIVON$/.test(document.title)) document.title = BASE_TITLE;   /* leaving Help: the tab gets its normal title back */
      return false;
    }
    root.dataset.lvView = "help";
    markNav(true);
    onShow(h, { initial: e === "initial" });
    return true;
  }

  /* a contextual help link for other screens: <a href="#help/a/{id}" data-lv-help-link>… */
  function link(articleId, label, cls) {
    var a = byId[articleId];
    if (!a) return "";
    return '<a class="' + esc(cls || "lv-help-link") + '" href="' + hrefOf(a) + '" data-lv-help-link="' + esc(a.id) + '">' + esc(label || fill(a.title)) + "</a>";
  }

  window.LivonHelp = {
    onShow: onShow, route: route, search: search, link: link, article: function (id) { return byId[id] || null; },
    _test: { parse: parse, render: render, norm: norm, tight: tight, tokensOf: tokensOf, fill: fill, viewHome: viewHome, viewCategory: viewCategory, viewArticle: viewArticle,
      viewSearch: viewSearch, viewStatus: viewStatus, viewNotFound: viewNotFound, titleOf: titleOf, state: function () { return current; } }
  };

  function boot() {
    bind();
    window.addEventListener("hashchange", route);
    route("initial");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
