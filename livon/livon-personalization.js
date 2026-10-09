/*
 * LIVON Personalization — anonymous, local-first, rule-based (Onboarding V1).
 *
 *   Onboarding (livon-platform.js)  ─┐
 *   My Life settings                ─┼→ LivonPersonalization  → the SAME keys every screen already reads
 *   Home · Today · Explore · Community ─┘        livon.lifeStage · livon.lifeInterests · livon.lifeEvents
 *
 * This file adds no new profile store. The profile is the three existing preference keys (already classified
 * ACCOUNT_SYNC "preferences" in LivonUserData, so a future Newon+ import stays an explicit user choice).
 * The only new key is livon.personalization.v1: first-run state and the unfinished onboarding draft (device only).
 *
 * Rules
 *   - Only Life Stage (an age band), interests and Life Events. No name, birth date, contact, address, income,
 *     health, or any other sensitive field is asked, inferred or stored.
 *   - Deterministic rules, no AI call, no network, no analytics transport. Nothing here uploads anything.
 *   - Personalization only re-orders. It never hides a screen or a category, and with an empty profile every
 *     caller keeps its generic behaviour.
 *   - Taxonomy comes from the data files (LivonLifeData.stages / .interests, the Life Event catalog). Nothing is invented.
 */
(function (root) {
  "use strict";

  var VERSION = 1;
  var KEY_META = "livon.personalization.v1";
  var KEY_STAGE = "livon.lifeStage";
  var KEY_INTERESTS = "livon.lifeInterests";
  var KEY_ML_INTERESTS = "livon.mlInterests";
  var KEY_EVENTS = "livon.lifeEvents";
  var KEY_PLATFORM = "livon.platform.v1";
  var STATES = ["NEW", "IN_PROGRESS", "COMPLETED", "SKIPPED"];
  var STEPS = ["stage", "interests", "events", "preview"];
  var MAX_INTERESTS = 20, MAX_EVENTS = 8;
  /* measurement names for a future, consented analytics layer — nothing is sent anywhere today */
  var ANALYTICS_EVENTS = ["onboarding_started", "stage_selected", "interest_selected", "life_event_selected", "onboarding_completed", "onboarding_skipped", "personalization_updated"];

  /* ───────── storage: LivonUserData (→ storage guard) when present, plain guarded localStorage otherwise ───────── */
  function fit(v, fb) {
    if (Array.isArray(fb)) return Array.isArray(v) ? v.filter(function (x) { return x != null; }) : fb;
    if (fb && typeof fb === "object") return v && typeof v === "object" && !Array.isArray(v) ? v : fb;
    return v;
  }
  function read(key, fb) {
    var UD = root.LivonUserData;
    if (UD && typeof UD.read === "function") { try { return UD.read(key, fb); } catch (e) { return fb; } }
    try { var raw = root.localStorage.getItem(key); return fit(raw ? JSON.parse(raw) : fb, fb); } catch (e) { return fb; }
  }
  function write(key, value) {
    var UD = root.LivonUserData;
    if (UD && typeof UD.write === "function") { try { return UD.write(key, value) !== false; } catch (e) { return false; } }
    try { root.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }
  /* true when the browser gave us no persistent storage (the storage guard installed an in-memory one) */
  function storageIsTemporary() {
    var f = root.LIVON_STORAGE_FALLBACK;
    return Array.isArray(f) && f.indexOf("localStorage") >= 0;
  }

  function uniq(a) { var out = []; (a || []).forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); }); return out; }
  function str(v) { return typeof v === "string" ? v.replace(/\s+/g, " ").trim() : ""; }

  /* ───────── taxonomy (read from the existing data files) ───────── */
  function stages() {
    var list = root.LivonLifeData && Array.isArray(root.LivonLifeData.stages) ? root.LivonLifeData.stages : [];
    return list.filter(function (s) { return s && /^[1-7]0$/.test(String(s.id)); }).map(function (s) { return { id: String(s.id), label: String(s.label || s.id + "대") }; });
  }
  function stageLabel(id) {
    var s = stages().filter(function (x) { return x.id === id; })[0];
    return s ? s.label : "";
  }
  function validStage(v) {
    if (v && typeof v === "object" && v.id != null) v = v.id;   /* an older build stored {id} */
    v = str(String(v == null ? "" : v));
    if (!/^[1-7]0$/.test(v)) return "";
    var known = stages();
    return !known.length || known.some(function (s) { return s.id === v; }) ? v : "";
  }
  function allEvents() {
    var SD = root.LivonScreenData, list = null;
    if (SD && typeof SD.lifeEvents === "function") { try { list = SD.lifeEvents(); } catch (e) { list = null; } }
    if (!Array.isArray(list)) list = root.LivonLifeEvents && Array.isArray(root.LivonLifeEvents.events) ? root.LivonLifeEvents.events : [];
    return list.filter(function (e) { return e && typeof e.id === "string" && e.id && typeof e.title === "string"; });
  }
  function eventById(id) { return allEvents().filter(function (e) { return e.id === id; })[0] || null; }
  /* Life Events for the chosen stage first; the rest stay reachable behind "더 보기" */
  function eventsFor(stage) {
    var st = validStage(stage), list = allEvents();
    var pick = function (e) { return { id: e.id, title: e.title, stages: (e.stages || []).slice() }; };
    if (!st) return { primary: list.slice(0, 12).map(pick), more: list.slice(12).map(pick) };
    return {
      primary: list.filter(function (e) { return (e.stages || []).indexOf(st) >= 0; }).map(pick),
      more: list.filter(function (e) { return (e.stages || []).indexOf(st) < 0; }).map(pick)
    };
  }

  /* ───────── the Data Platform repository (already built for the screens; never rebuilt here) ───────── */
  function repo() {
    var SD = root.LivonScreenData;
    if (!SD || typeof SD.repository !== "function") return null;
    try { return SD.repository(); } catch (e) { return null; }
  }
  /* which Explore domains an interest belongs to — the platform's own classifier, not a second mapping */
  function interestDomains(interest) {
    var P = root.LivonDataPlatform;
    if (!P || typeof P.domainsOfText !== "function") return [];
    try { return P.domainsOfText(interest) || []; } catch (e) { return []; }
  }
  /* An entity matches an interest when the interest word is in its category, tags or title. Life Stage topics carry
     curated group tags (취업·커리어, 주거·독립 …), so for them the platform's domain classifier may also connect
     an interest to the group (일자리 → 취업·커리어). Other rows are matched by the word only: their tags include
     proper nouns, which a keyword classifier misreads. */
  var labelDomains = {};
  function matchesInterest(e, interest, domains) {
    if (!interest) return false;
    var blob = [e.category || ""].concat(e.tags || []).join(" ");
    if (blob.indexOf(interest) >= 0 || String(e.title || "").indexOf(interest) >= 0) return true;
    if (!domains.length || !/^topic:/.test(String(e.id))) return false;
    var own = labelDomains[blob] || (labelDomains[blob] = interestDomains(blob));
    return domains.some(function (d) { return d !== "senior" && own.indexOf(d) >= 0; });
  }
  /* interests offered in onboarding: the existing list, minus entries that currently lead to no content */
  var optionCache = null, optionCacheRepo = null;
  function interestOptions() {
    var base = root.LivonLifeData && Array.isArray(root.LivonLifeData.interests) ? root.LivonLifeData.interests.filter(function (x) { return typeof x === "string" && x; }) : [];
    var r = repo();
    if (!r) return base.slice();
    if (optionCache && optionCacheRepo === r) return optionCache.slice();
    var pool = candidates(r, "");
    optionCache = base.filter(function (i) { var d = interestDomains(i); return pool.some(function (e) { return matchesInterest(e, i, d); }); });
    optionCacheRepo = r;
    return optionCache.slice();
  }

  /* ───────── profile ───────── */
  function sanitizeProfile(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var interests = uniq((Array.isArray(raw.interests) ? raw.interests : []).map(str).filter(function (x) { return x && x.length <= 20; })).slice(0, MAX_INTERESTS);
    var known = allEvents().map(function (e) { return e.id; });
    var events = uniq((Array.isArray(raw.lifeEvents) ? raw.lifeEvents : []).map(str).filter(function (x) { return /^[a-z0-9-]{1,40}$/.test(x) && (!known.length || known.indexOf(x) >= 0); })).slice(0, MAX_EVENTS);
    return { lifeStage: validStage(raw.lifeStage), interests: interests, lifeEvents: events };
  }
  function meta() {
    var m = read(KEY_META, null);
    if (!m || typeof m !== "object" || Array.isArray(m)) return { version: VERSION, state: "", step: "", draft: null, updatedAt: 0 };
    /* an unknown (newer or damaged) record is ignored, not trusted: start from the defaults */
    var v = typeof m.version === "number" ? m.version : 0;
    if (v !== VERSION) m = migrate(m, v);
    return {
      version: VERSION,
      state: STATES.indexOf(m.state) >= 0 ? m.state : "",
      step: STEPS.indexOf(m.step) >= 0 ? m.step : "",
      draft: m.draft && typeof m.draft === "object" ? sanitizeProfile(m.draft) : null,
      updatedAt: typeof m.updatedAt === "number" && isFinite(m.updatedAt) ? m.updatedAt : 0
    };
  }
  /* schema migrations (old version → current). Version 0 = a record written before versioning. */
  function migrate(m, from) {
    if (from === 0) return { version: VERSION, state: m.state, step: m.step, draft: m.draft, updatedAt: m.updatedAt };
    return {};
  }
  function writeMeta(patch) {
    var m = meta(), k;
    for (k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) m[k] = patch[k];
    m.version = VERSION;
    m.updatedAt = Date.now();
    write(KEY_META, m);
    return m;
  }
  function legacyFlags() {
    var p = read(KEY_PLATFORM, null);
    return p && typeof p === "object" ? { onboarded: p.onboarded === true, skipped: p.onboardSkipped === true } : { onboarded: false, skipped: false };
  }
  function state() {
    var m = meta();
    if (m.state) return m.state;
    var f = legacyFlags();
    if (f.onboarded) return "COMPLETED";
    if (f.skipped) return "SKIPPED";
    return "NEW";
  }
  function getProfile() {
    var p = sanitizeProfile({ lifeStage: read(KEY_STAGE, ""), interests: read(KEY_INTERESTS, []), lifeEvents: read(KEY_EVENTS, []) });
    var st = state();
    return { version: VERSION, lifeStage: p.lifeStage, interests: p.interests, lifeEvents: p.lifeEvents, onboardingCompleted: st === "COMPLETED", state: st, updatedAt: meta().updatedAt };
  }
  function hasSignals(p) { return !!(p && (p.lifeStage || (p.interests || []).length || (p.lifeEvents || []).length)); }

  function setPlatformFlags(onboarded, skipped) {
    var p = read(KEY_PLATFORM, null);
    if (!p || typeof p !== "object" || Array.isArray(p)) p = {};
    p.onboarded = !!onboarded; p.onboardSkipped = !!skipped;
    write(KEY_PLATFORM, p);
  }
  /* writes the three preference keys; every other key on the device is left alone */
  function saveProfile(next) {
    var p = sanitizeProfile(next);
    var before = read(KEY_INTERESTS, []);
    write(KEY_STAGE, p.lifeStage || null);
    write(KEY_INTERESTS, p.interests);
    write(KEY_EVENTS, p.lifeEvents);
    /* Explore also reads livon.mlInterests: keep it consistent with what the user just chose */
    var ml = read(KEY_ML_INTERESTS, []);
    if (Array.isArray(ml)) {
      var dropped = (Array.isArray(before) ? before : []).filter(function (x) { return p.interests.indexOf(x) < 0; });
      write(KEY_ML_INTERESTS, uniq(ml.filter(function (x) { return dropped.indexOf(x) < 0; }).concat(p.interests)).slice(-40));
    }
    return p;
  }

  /* does this device already hold LIVON data (a returning user)? Counts only; nothing is read out. */
  function hasExistingData() {
    var p = read(KEY_PLATFORM, null), n = 0;
    if (p && typeof p === "object" && Array.isArray(p.saves)) n += p.saves.length;
    var ml = read("livon.mlStore.v1", null);
    if (ml && typeof ml === "object") ["todos", "goals", "events", "checklists", "habits", "projects", "journal", "transactions", "experiences"].forEach(function (k) { if (Array.isArray(ml[k])) n += ml[k].length; });
    var cm = read("livon.cmStore.v1", null);
    if (cm && typeof cm === "object") { if (Array.isArray(cm.posts)) n += cm.posts.length; if (Array.isArray(cm.comments)) n += cm.comments.length; }
    var ai = read("livon.aiStore.v1", null);
    if (ai && typeof ai === "object" && Array.isArray(ai.threads)) n += ai.threads.length;
    return n > 0 || hasSignals(sanitizeProfile({ lifeStage: read(KEY_STAGE, ""), interests: read(KEY_INTERESTS, []), lifeEvents: read(KEY_EVENTS, []) }));
  }
  /* what the page may show on arrival. Never a blocking dialog:
       welcome — first visit, nothing on this device
       invite  — the device already has LIVON data: a small optional invitation
       resume  — onboarding was started and not finished
       none    — completed or skipped (the entry points in Home / My Life stay available) */
  function entry() {
    var st = state();
    if (st === "COMPLETED" || st === "SKIPPED") return "none";
    if (st === "IN_PROGRESS") return "resume";
    return hasExistingData() ? "invite" : "welcome";
  }

  var log = [];
  function track(name, detail) {
    if (ANALYTICS_EVENTS.indexOf(name) < 0) return;
    /* in-memory only, counts and step names — never the chosen values, never sent */
    log.push({ event: name, step: detail && typeof detail.step === "string" ? detail.step : "", at: Date.now() });
    if (log.length > 50) log.shift();
  }

  function start() {
    var m = meta();
    var draft = m.draft || sanitizeProfile({ lifeStage: read(KEY_STAGE, ""), interests: read(KEY_INTERESTS, []), lifeEvents: read(KEY_EVENTS, []) });
    var st = state();
    /* an edit after completion keeps COMPLETED; only a first run becomes IN_PROGRESS */
    writeMeta({ state: st === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS", step: m.step || "stage", draft: draft });
    track("onboarding_started");
    return { step: m.step || "stage", draft: draft };
  }
  function saveDraft(step, draft) {
    var d = sanitizeProfile(draft);
    writeMeta({ step: STEPS.indexOf(step) >= 0 ? step : "stage", draft: d });
    return d;
  }
  function complete(draft) {
    var p = saveProfile(draft);
    writeMeta({ state: "COMPLETED", step: "", draft: null });
    setPlatformFlags(true, false);
    track("onboarding_completed");
    return p;
  }
  function skip() {
    var st = state();
    /* leaving an edit does not undo a finished onboarding */
    writeMeta({ state: st === "COMPLETED" ? "COMPLETED" : "SKIPPED", step: "", draft: null });
    if (st !== "COMPLETED") setPlatformFlags(false, true);
    track("onboarding_skipped");
  }
  /* settings edit outside onboarding (My Life): saves at once, recommendations follow on the next render */
  function update(patch) {
    var cur = getProfile(), next = { lifeStage: cur.lifeStage, interests: cur.interests, lifeEvents: cur.lifeEvents };
    patch = patch || {};
    if ("lifeStage" in patch) next.lifeStage = patch.lifeStage;
    if ("interests" in patch) next.interests = patch.interests;
    if ("lifeEvents" in patch) next.lifeEvents = patch.lifeEvents;
    var p = saveProfile(next);
    writeMeta({});
    track("personalization_updated");
    return p;
  }
  /* clears Life Stage, interests and Life Events only. Saves, to-dos, goals, posts, comments … are not touched. */
  function reset() {
    var before = read(KEY_INTERESTS, []);
    write(KEY_STAGE, null);
    write(KEY_INTERESTS, []);
    write(KEY_EVENTS, []);
    var ml = read(KEY_ML_INTERESTS, []);
    if (Array.isArray(ml) && Array.isArray(before)) write(KEY_ML_INTERESTS, ml.filter(function (x) { return before.indexOf(x) < 0; }));
    writeMeta({ state: "SKIPPED", step: "", draft: null });
    setPlatformFlags(false, true);
    track("personalization_updated");
  }

  /* ───────── rule-based recommendation ─────────
     signal            weight   user-facing reason
     Life Event match    4      "선택한 ‘첫 취업’ 관련"   (3 when linked from a matching topic)
     Life Stage match    3      "20대 주제"
     Interest match      2 (×2) "관심사 ‘주거’"
     A row tied to another age band is never recommended to the chosen band. */
  var AGE_TAG = /^([1-7]0)대$/;
  var FAMILY_KEYS = ["육아", "보육", "출산", "결혼"];
  function ageContextOk(e, stage) {
    if (!stage) return true;
    if ((e.lifeStages || []).length) return e.lifeStages.indexOf(stage) >= 0;
    var tags = e.tags || [], ages = [];
    tags.forEach(function (t) { var m = AGE_TAG.exec(t); if (m) ages.push(m[1]); });
    if (ages.length && ages.indexOf(stage) < 0) return false;
    if (tags.indexOf("청소년") >= 0 && stage !== "10") return false;
    if (tags.indexOf("청년") >= 0 && stage !== "20" && stage !== "30") return false;
    /* an all-age row the platform classifies as senior is for the 50s and later */
    if ((e.domains || []).indexOf("senior") >= 0 && Number(stage) < 50) return false;
    /* an all-age row named after a family-formation Life Event (육아·보육·출산·결혼) belongs to that event's age bands —
       the same idea as the repository's category rule, applied to the title (e.g. a 보육·육아 portal is not offered to 70대) */
    var P = root.LivonDataPlatform, map = P && P.CATEGORY_LIFE_EVENTS || {}, text = (e.category || "") + " " + (e.title || ""), allowed = [];
    FAMILY_KEYS.forEach(function (k) {
      if (text.indexOf(k) >= 0) (map[k] || []).forEach(function (id) { var ev = eventById(id); if (ev) allowed = allowed.concat(ev.stages || []); });
    });
    if (allowed.length && allowed.indexOf(stage) < 0) return false;
    return true;
  }
  /* the same age-context rule for free text that has no curated tags (a community post title) */
  function textAgeOk(text, stage) {
    var st = validStage(stage);
    return !st || ageContextOk({ title: String(text || ""), category: "", tags: [], lifeStages: [], domains: [] }, st);
  }
  var SKIP_TYPES = { lifeStage: 1, lifeEvent: 1, provider: 1, communityContent: 1 };
  function candidates(r, stage) {
    var list = [];
    try {
      /* the repository applies its own context rule for all-age rows (e.g. a childcare portal is not offered to 70대) */
      list = r.getRecommendations({ lifeStage: stage || undefined, limit: 100000 }).items.map(function (x) { return x.entity; });
    } catch (e) { list = []; }
    return list.filter(function (e) { return e && !SKIP_TYPES[e.type] && ageContextOk(e, stage); });
  }
  /* ids that may be recommended to a Life Stage (age-context rule) — for screens that rank their own records */
  var allowCache = { repo: null, stage: null, map: null };
  function allowedIds(stage) {
    var st = validStage(stage), r = repo();
    if (!st || !r) return null;
    if (allowCache.repo === r && allowCache.stage === st) return allowCache.map;
    var map = {};
    candidates(r, st).forEach(function (e) { map[e.id] = 1; });
    allowCache = { repo: r, stage: st, map: map };
    return map;
  }
  function kindOf(e) {
    if (/^topic:/.test(e.id)) return "topic";
    if (e.meta && e.meta.todayCategory) return "today";
    if (e.type === "policy") return "policy";
    if (e.type === "program" || e.type === "class" || e.type === "event") return "program";
    if (e.type === "service" || e.type === "expert") return "service";
    return "guide";
  }
  var KIND_LABEL = { topic: "주제", guide: "가이드", policy: "정책·제도", service: "서비스", program: "프로그램", today: "오늘의 발견" };
  function reasonText(reason) {
    if (!reason) return "";
    /* states only what the user chose — never popularity or anything LIVON cannot know */
    if (reason.type === "event") return "선택한 ‘" + reason.label + "’ 관련";
    if (reason.type === "interest") return "관심사 ‘" + reason.label + "’";
    if (reason.type === "stage") return reason.label + " 주제";
    return "";
  }
  /*
   * recommend(profile, {limit, kinds}) → { personalized, method, items:[{ id, kind, kindLabel, title, summary, href, score, reasons[], why }], gaps:[{id,title}] }
   * reasons: [{ type: "event"|"stage"|"interest", value, label }] — the full, testable WHY. why = the first one as a short sentence.
   * gaps: chosen Life Events that have no guide yet (nothing is made up for them; other signals still apply).
   */
  function recommend(profile, opts) {
    opts = opts || {};
    var p = sanitizeProfile(profile || getProfile());
    var out = { personalized: false, method: "rule-based", items: [], gaps: [] };
    var r = repo();
    if (!r || !hasSignals(p)) return out;
    var pool = candidates(r, p.lifeStage);
    var doms = {}; p.interests.forEach(function (i) { doms[i] = interestDomains(i); });
    var evTitle = {}; p.lifeEvents.forEach(function (id) { var ev = eventById(id); evTitle[id] = ev ? ev.title : id; });
    var covered = {};
    /* rows a matching topic explicitly links to (its policies, services, guides …) inherit that Life Event as their reason */
    var linked = {};
    pool.forEach(function (e) {
      if (!/^topic:/.test(String(e.id))) return;
      var ev = p.lifeEvents.filter(function (id) { return (e.lifeEvents || []).indexOf(id) >= 0; })[0];
      if (!ev) return;
      var rel = e.relations || {};
      Object.keys(rel).forEach(function (k) { if (k !== "topicIds" && Array.isArray(rel[k])) rel[k].forEach(function (id) { if (!linked[id]) linked[id] = ev; }); });
    });
    var scored = [];
    pool.forEach(function (e) {
      var s = 0, why = [];
      p.lifeEvents.forEach(function (id) {
        if ((e.lifeEvents || []).indexOf(id) >= 0) { s += 4; covered[id] = 1; why.push({ type: "event", value: id, label: evTitle[id] }); }
      });
      if (!why.length && linked[e.id]) { s += 3; why.push({ type: "event", value: linked[e.id], label: evTitle[linked[e.id]], via: "topic" }); }
      if (p.lifeStage && (e.lifeStages || []).indexOf(p.lifeStage) >= 0) { s += 3; why.push({ type: "stage", value: p.lifeStage, label: stageLabel(p.lifeStage) || p.lifeStage + "대" }); }
      var hits = 0;
      p.interests.forEach(function (i) {
        if (hits < 2 && matchesInterest(e, i, doms[i])) { s += 2; hits++; why.push({ type: "interest", value: i, label: i }); }
      });
      /* a stage alone would list every topic of the band: with other signals present, a stage-only row is not a recommendation */
      var onlyStage = why.length === 1 && why[0].type === "stage";
      if (!s || (onlyStage && (p.interests.length || p.lifeEvents.length) && kindOf(e) !== "topic")) return;
      if (e.meta && e.meta.featured) s += 0.5;
      scored.push({ e: e, score: s, reasons: why });
    });
    scored.sort(function (a, b) { return b.score - a.score || String(a.e.title).localeCompare(String(b.e.title)); });
    var kinds = opts.kinds || null;
    out.items = scored.filter(function (x) { return !kinds || kinds.indexOf(kindOf(x.e)) >= 0; }).slice(0, opts.limit || 12).map(function (x) {
      var k = kindOf(x.e);
      return { id: x.e.id, kind: k, kindLabel: KIND_LABEL[k], type: x.e.type, title: x.e.title, summary: x.e.summary || "", href: x.e.href || "", score: x.score, reasons: x.reasons, why: reasonText(x.reasons[0]) };
    });
    out.gaps = p.lifeEvents.filter(function (id) { return !covered[id]; }).map(function (id) { return { id: id, title: evTitle[id] }; });
    out.personalized = out.items.length > 0;
    return out;
  }
  /* the onboarding result screen: a few real rows per kind, so the user sees what changes */
  function preview(profile) {
    var p = sanitizeProfile(profile || getProfile());
    var all = recommend(p, { limit: 400 });
    var take = { topic: 3, guide: 2, policy: 2, service: 2, program: 1, today: 2 }, groups = [], seen = {};
    ["topic", "guide", "policy", "service", "program", "today"].forEach(function (k) {
      var items = all.items.filter(function (x) { return x.kind === k; }).slice(0, take[k]);
      items.forEach(function (x) { seen[x.id] = 1; });
      if (items.length) groups.push({ kind: k, label: KIND_LABEL[k], items: items });
    });
    return { personalized: all.personalized, groups: groups, gaps: all.gaps, total: Object.keys(seen).length, profile: p };
  }

  /* score helper for screens that keep their own records (Today, Explore, Community): adds the Life Event signal
     without changing how they already use Life Stage and interests. Returns 0 when nothing matches. */
  function eventBoost(text, lifeEvents) {
    var p = Array.isArray(lifeEvents) ? lifeEvents : getProfile().lifeEvents, hit = null;
    text = String(text || "");
    p.some(function (id) {
      var ev = eventById(id);
      if (!ev) return false;
      var words = [ev.title].concat(ev.needs || []).filter(function (w) { return typeof w === "string" && w.length >= 2; });
      if (words.some(function (w) { return text.indexOf(w) >= 0; })) { hit = { type: "event", value: id, label: ev.title }; return true; }
      return false;
    });
    return hit;
  }

  /* A future LIVON AI may be given this context — only when the user asks it to. Nothing calls an AI from here. */
  function aiContext() {
    var p = getProfile();
    return { lifeStage: p.lifeStage ? stageLabel(p.lifeStage) : "", interests: p.interests.slice(), lifeEvents: p.lifeEvents.map(function (id) { var ev = eventById(id); return ev ? ev.title : ""; }).filter(Boolean) };
  }
  /* A future Newon+ account may import the same three values — only after the user agrees (see LivonUserData.planLoginImport). */
  function exportForAccount() {
    var p = getProfile();
    return { version: VERSION, lifeStage: p.lifeStage, interests: p.interests.slice(), lifeEvents: p.lifeEvents.slice(), updatedAt: p.updatedAt };
  }

  root.LivonPersonalization = {
    VERSION: VERSION, KEY: KEY_META, STATES: STATES.slice(), STEPS: STEPS.slice(), ANALYTICS_EVENTS: ANALYTICS_EVENTS.slice(),
    ENGINE: "LOCAL RULE-BASED",
    stages: stages, stageLabel: stageLabel, interestOptions: interestOptions, eventsFor: eventsFor, eventById: eventById,
    sanitizeProfile: sanitizeProfile, getProfile: getProfile, hasSignals: hasSignals,
    state: state, entry: entry, hasExistingData: hasExistingData, storageIsTemporary: storageIsTemporary,
    start: start, saveDraft: saveDraft, draft: function () { var m = meta(); return { step: m.step || "stage", draft: m.draft }; },
    complete: complete, skip: skip, update: update, reset: reset,
    recommend: recommend, preview: preview, reasonText: reasonText, eventBoost: eventBoost, allowedIds: allowedIds, textAgeOk: textAgeOk,
    aiContext: aiContext, exportForAccount: exportForAccount,
    _log: function () { return log.slice(); }
  };
})(typeof window !== "undefined" ? window : globalThis);
