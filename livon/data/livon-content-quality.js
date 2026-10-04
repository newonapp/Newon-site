/*
 * LIVON content quality evaluator — the single implementation shared by
 *   · scripts/livon-content-quality.mjs  (Node CLI / tests, loaded into the same vm context as the browser scripts)
 *   · /livon/admin/data/                 (local Data Manager)
 * Read-only and deterministic: it inspects the Data Platform repository, the screen bridge and the search index,
 * and never writes to them. The score is data-completeness QA for editors, never shown to LIVON users.
 */
(function (root) {
  "use strict";
  /* ───────── vocabulary ───────── */
  const FLAGS = {
    MISSING_SUMMARY: 'summary is empty',
    PLACEHOLDER_SUMMARY: 'summary is a placeholder ("확장 예정 …") rather than a description',
    WEAK_SUMMARY: 'summary only restates the title ("X입니다.") — says neither who it is for nor what to do',
    DUPLICATE_SUMMARY: 'another record has exactly the same summary',
    TITLE_LENGTH: 'title is shorter than 2 or longer than 30 characters',
    MISSING_SOURCE: 'factual record without an official link or a traceable source',
    INVALID_URL: 'URL is not a well-formed https URL / internal route',
    MISSING_RELATION: 'guide-type record with no related record at all',
    BROKEN_RELATION: 'relation points to a record that does not exist, to itself, or repeats an id',
    TOO_MANY_RELATIONS: 'more than 12 relations of one kind',
    DATE_VERIFICATION_REQUIRED: 'time-bound record (policy/program/class/event) without an official date — dates are never guessed',
    STALE_REVIEW_REQUIRED: 'lastCheckedAt is older than the freshness policy for its type',
    DUPLICATE_CANDIDATE: 'same title or same official URL as another record (kept on purpose — see duplicates[].reason)',
    WEAK_SEARCH_METADATA: 'no category and no tags — only the title can be searched',
    UNSOURCED_SPECIFIC: 'states a price/budget/amount without an official link to verify it',
    TIME_SENSITIVE_CLAIM: 'names a specific year or "현재 운영/모집/신청" as a fact',
    FIELD_CONFLICT: 'two fields of the same record disagree (e.g. a budget amount next to "프로그램별 상이") — never auto-corrected',
    ORPHAN: 'not shown on any screen and not referenced by any other record'
  };
  const TIME_BOUND = { event: 1, program: 1, policy: 1, class: 1 };
  const FACTUAL = { place: 1, event: 1, program: 1, policy: 1, expert: 1, provider: 1, class: 1 };
  const RELATION_EXPECTED = { topic: 1, td: 1, le: 1, svc: 1 };
  const PREFIX_KIND = { stage: 'Life Stage', le: 'Life Event', topic: 'Life Stage topic', pol: 'Official portal', svc: 'Service type', tool: 'Stage tool card', td: "Today's Discovery", ex: 'Explore item', prov: 'Provider (derived)', cm: 'Community group', ch: 'Community challenge' };
  const PROVENANCE = { A: 'LIVON guide', B: 'Government / local government official', C: 'Public institution', D: 'Newon service', E: 'Other' };
  
  const L = s => [...String(s || '')].length;
  const prefix = e => e.id.split(':')[0];
  const safeUrl = u => { try { const x = new URL(u); return x.protocol === 'https:' && /\./.test(x.hostname) && !/\s/.test(u); } catch { return false; } };
  const internalRoute = u => /^#[\w\-./?=&%]*$/.test(u || '') || /^\/[\w\-./#]*$/.test(u || '');
  
  function provenanceClass(e) {
    const url = e.officialUrl || e.sourceUrl || '';
    if (e.sourceType === 'internal' || /newon|ongil/i.test(e.sourceName || '') || (e.meta && e.meta.internalUrl)) return 'D';
    if (e.sourceType === 'editorial' || e.sourceType === 'user' || e.sourceType === 'platform') return 'A';
    let host = ''; try { host = new URL(url).hostname; } catch {}
    if (e.sourceType === 'official' || e.sourceType === 'public_api') {
      if (/(\.go\.kr|(^|\.)gov\.kr|(^|\.)korea\.kr)$/.test(host)) return 'B'; /* central · local government (정부24 is gov.kr) */
      if (host) return 'C';
    }
    return 'E';
  }
  
  /* ───────── search test set (query → what a relevant top-5 result looks like) ───────── */
  const SEARCH_SET = [
    ['취업', /취업|구직|일자리|채용|커리어/], ['구직', /취업|구직|일자리|채용/], ['청년 월세', /주거|월세|청년/], ['월세', /주거|월세|임대/],
    ['창업 지원', /창업/], ['창업', /창업/], ['사업', /사업|창업/], ['아이 키우기', /육아|보육|아이|자녀/], ['육아', /육아|보육/],
    ['양육', /육아|양육|보육|자녀/], ['은퇴 준비', /은퇴|노후/], ['은퇴', /은퇴|노후/], ['노후', /노후|은퇴|연금/], ['부모님 돌봄', /돌봄|부모/],
    ['운동', /운동|체육|스포츠/], ['재취업', /재취업|일자리|취업/], ['세금 상담', /세금|세무|홈택스/], ['세금', /세금|세무|홈택스/],
    ['배우고 싶어', /배움|교육|클래스|강좌|학습/], ['배우기', /배움|교육|클래스|강좌|학습/], ['이사', /이사/], ['결혼 준비', /결혼/],
    ['집', /집|주거|주택/], ['주거', /주거|주택/], ['자격증', /자격/], ['이력서', /이력서/], ['면접', /면접/], ['연금', /연금/],
    ['건강검진', /검진/], ['마음 상담', /마음|정신|상담/], ['우울', /마음|정신|상담/], ['도서관', /도서관/], ['전시', /전시|미술관|문화/],
    ['여행', /여행/], ['캠핑', /캠핑|여행|나들이/], ['독립', /독립|자취/], ['자취', /독립|자취|주거/], ['청약', /주택|주거|청약|마이홈/],
    ['전세', /전세|주거|주택/], ['대출', /대출|금융/], ['저축', /저축|비상금/], ['재테크', /재테크|자산|저축|투자|금융|월급/],
    ['보육', /보육|어린이집|육아/], ['어린이집', /어린이집|보육/], ['출산', /출산/], ['임신', /임신|출산/], ['요양', /요양|돌봄/],
    ['치매', /요양|돌봄|부모/], ['디지털', /디지털/], ['스마트폰', /스마트폰|디지털|키오스크/], ['봉사', /봉사|사회활동|사회공헌/],
    ['평생교육', /평생|배움|교육/], ['외국어', /외국어|영어/], ['요리', /요리|베이킹|식사|맛/], ['법률 상담', /법률|변호사|계약/],
    ['변호사', /변호사|법률/], ['이직', /이직|커리어/], ['첫 월급', /월급/], ['프리랜서', /프리랜서/], ['장학금', /장학|학자금/],
    ['대학', /대학|입시/], ['공부', /공부|학습/], ['친구', /친구|관계/], ['일자리', /일자리|취업|채용/], ['노인 일자리', /일자리|노인|시니어/],
    ['시니어', /시니어|노인|은퇴/]
  ];
  
  /* ───────── recommendation scenarios (age / life event / interest only — nothing personal) ───────── */
  const SCENARIOS = [
    ['10대 학생', { lifeStage: '10', lifeEvent: 'enroll', interests: ['학습', '진로'] }, /학교|학습|공부|진로|입학|과제|수행/],
    ['20대 취업', { lifeStage: '20', lifeEvent: 'first-job', interests: ['취업'] }, /취업|이력서|면접|직장|채용|커리어/],
    ['20대 독립', { lifeStage: '20', lifeEvent: 'independent', interests: ['주거'] }, /독립|주거|이사|생활비|임대/],
    ['30대 창업', { lifeStage: '30', lifeEvent: 'startup', interests: ['창업'] }, /창업|고객|사업/],
    ['30대 육아', { lifeStage: '30', lifeEvent: 'parenting', interests: ['육아'] }, /육아|어린이집|보육|복직|돌봄/],
    ['40대 자산/가족', { lifeStage: '40', interests: ['재테크', '가족'] }, /자산|투자|가족|가계|재무|대출|교육비|노후/],
    ['50대 재취업', { lifeStage: '50', lifeEvent: 'job-change', interests: ['재취업'] }, /재취업|커리어|경력|일|이직/],
    ['60대 은퇴', { lifeStage: '60', lifeEvent: 'retire-prep', interests: ['은퇴'] }, /은퇴|노후|연금|생활비|일주일/],
    ['70대+ 생활', { lifeStage: '70', interests: ['건강', '돌봄'] }, /건강|돌봄|노후|검진|운동|복지|시니어/]
  ];
  
  function evaluate(ctx, opts) {
    opts = opts || {};
    const now = opts.now == null ? Date.now() : opts.now;
    const SD = ctx.LivonScreenData, repo = SD.repository(), S = ctx.LivonSearch;
    const all = repo.all({ includeSamples: true, includeUnsourced: true, includeExpired: true, includeDuplicates: true });
    const byId = new Map(all.map(e => [e.id, e]));
    const tools = new Set((ctx.LivonLifeData.stages || []).flatMap(s => (s.services || []).map(x => 'tool:' + x.id)));
  
    /* ── where each record is used ── */
    const screens = new Map(all.map(e => [e.id, new Set()]));
    const use = (id, s) => { if (screens.has(id)) screens.get(id).add(s); };
    const visible = id => !repo.hiddenReason(id);
    SD.lifeEvents().forEach(ev => { use('le:' + ev.id, 'HOME'); use('le:' + ev.id, 'LIFE STAGE'); use('le:' + ev.id, 'DETAIL'); });
    SD.todayContents().forEach(c => { use('td:' + c.id, 'TODAY'); use('td:' + c.id, 'DETAIL'); use('td:' + c.id, 'MY LIFE'); if (c.featured) use('td:' + c.id, 'HOME'); });
    SD.exploreItems().forEach(x => { use('ex:' + x.id, 'EXPLORE'); use('ex:' + x.id, 'DETAIL'); use('ex:' + x.id, 'MY LIFE'); });
    SD.topics().forEach(t => { const id = 'topic:' + t.id; use(id, 'LIFE STAGE'); use(id, 'DETAIL'); use(id, 'MY LIFE'); });
    SD.serviceTypes().forEach(s => { const id = 'svc:' + s.id; use(id, 'LIFE STAGE'); use(id, 'DETAIL'); use(id, 'MY LIFE'); });
    SD.policies().forEach(p => { const id = 'pol:' + p.id; use(id, 'LIFE STAGE'); use(id, 'MY LIFE'); });
    all.filter(e => e.type === 'lifeStage' && visible(e.id)).forEach(e => { use(e.id, 'LIFE STAGE'); use(e.id, 'HOME'); });
    all.filter(e => prefix(e) === 'tool' && visible(e.id)).forEach(e => { use(e.id, 'LIFE STAGE'); use(e.id, 'DETAIL'); });
    all.filter(e => (prefix(e) === 'cm' || prefix(e) === 'ch') && visible(e.id)).forEach(e => use(e.id, 'COMMUNITY'));
    const keyToId = k => /^lt:/.test(k) ? 'topic:' + k.slice(3) : /^le:/.test(k) ? k : k;
    S.index().forEach(x => use(keyToId(x.key), 'SEARCH'));
    /* incoming relations */
    const incoming = new Map(all.map(e => [e.id, 0]));
    all.forEach(e => Object.values(e.relations || {}).flat().concat(e.providerId ? [e.providerId] : []).forEach(id => { if (incoming.has(id) && id !== e.id) incoming.set(id, incoming.get(id) + 1); }));
  
    /* ── duplicates (title / official URL / summary) — each candidate gets a keep/merge decision ── */
    const group = f => { const m = {}; all.forEach(e => { const k = f(e); if (k) (m[k] = m[k] || []).push(e.id); }); return Object.entries(m).filter(([, v]) => v.length > 1); };
    const reasonFor = ids => {
      const ps = [...new Set(ids.map(id => id.split(':')[0]))];
      const stages = new Set(ids.map(id => (byId.get(id).lifeStages || []).join(',')));
      if (ps.length === 1 && stages.size === ids.length) return ['keep', 'AGE_VARIANT — same subject written for a different life stage'];
      if (ps.includes('prov')) return ['keep', 'DERIVED_PROVIDER — provider row derived from the Explore institution card (not shown on its own)'];
      if (ps.includes('pol') || (ps.includes('ex') && ps.includes('td'))) return ['keep', 'SAME_OFFICIAL_PORTAL — different entry points (portal link · institution card · guide) to one official site'];
      if (ps.includes('le') && (ps.includes('topic') || ps.includes('tool'))) return ['keep', 'LIFE_EVENT_VS_GUIDE — the Life Event groups the topic/tool; different screens'];
      if (ps.includes('svc') && (ps.includes('tool') || ps.includes('topic'))) return ['keep', 'DIFFERENT_ROLE — service-type guide vs stage topic/tool card (separate save ids)'];
      if (ps.length === 1 && ps[0] === 'tool') return ['keep', 'STAGE_TOOL_VARIANT — same tool offered on several stages (separate stage pages)'];
      if (ps.length === 1 && ps[0] === 'ex') return ['keep', 'GUIDE_VS_PORTAL — a LIVON guide that points to the same official portal'];
      return ['review', 'UNCLASSIFIED — check manually'];
    };
    const duplicates = [];
    group(e => e.title).forEach(([k, ids]) => { const [decision, reason] = reasonFor(ids); duplicates.push({ kind: 'title', key: k, ids, decision, reason }); });
    group(e => e.officialUrl || e.sourceUrl).forEach(([k, ids]) => { const [decision, reason] = reasonFor(ids); duplicates.push({ kind: 'url', key: k, ids, decision, reason }); });
    const dupSummary = new Map();
    group(e => e.summary).forEach(([k, ids]) => { ids.forEach(id => dupSummary.set(id, ids)); duplicates.push({ kind: 'summary', key: k.slice(0, 40), ids, decision: 'fix', reason: 'identical summaries say nothing about the individual record' }); });
    const dupCandidate = new Set(duplicates.filter(d => d.kind !== 'summary').flatMap(d => d.ids));
  
    /* ── per-record audit ── */
    const freshDays = { event: 7, program: 14, class: 14, policy: 30, place: 180, expert: 90, provider: 180, service: 180, content: 365 };
    const records = all.map(e => {
      const raw = repo.source(e.id) || {};
      const p = prefix(e), flags = new Set(), notes = [];
      const rel = e.relations || {};
      const relIds = Object.values(rel).flat();
      const urls = [e.officialUrl, e.sourceUrl, e.bookingUrl].filter(Boolean);
      /* summary */
      const sum = String(e.summary || '');
      if (!sum) flags.add('MISSING_SUMMARY');
      else if (/확장 예정|준비 중입니다|추후|TBD|lorem/i.test(sum)) flags.add('PLACEHOLDER_SUMMARY');
      else if (L(sum) < 16 && /입니다\.?$/.test(sum)) flags.add('WEAK_SUMMARY');
      else if (p === 'prov' && / 공식 안내$/.test(sum)) flags.add('WEAK_SUMMARY');
      else if (p === 'pol' && !/[다요]\.?$/.test(sum)) flags.add('WEAK_SUMMARY'); /* eligibility text used as a summary */
      if (dupSummary.has(e.id)) flags.add('DUPLICATE_SUMMARY');
      if (L(e.title) < 2 || L(e.title) > 30) flags.add('TITLE_LENGTH');
      /* source */
      if (FACTUAL[e.type] && !(e.officialUrl || e.sourceUrl) && !(e.meta && e.meta.internalUrl) && e.sourceType !== 'editorial') flags.add('MISSING_SOURCE');
      if (e.provenanceMissing) flags.add('MISSING_SOURCE');
      urls.forEach(u => { if (!safeUrl(u)) flags.add('INVALID_URL'); });
      if (e.href && !(safeUrl(e.href) || internalRoute(e.href))) flags.add('INVALID_URL');
      /* relations */
      const broken = [];
      Object.entries(rel).forEach(([k, ids]) => {
        if (new Set(ids).size !== ids.length) broken.push(k + ': repeated id');
        ids.forEach(id => { if (id === e.id) broken.push(k + ': self'); else if (!byId.has(id) && !(/^tool:/.test(id) && tools.has(id))) broken.push(k + ': ' + id); });
        /* stage tool cards and service types render as separate lists, so they are counted separately */
        const lists = k === 'serviceIds' ? [ids.filter(id => !/^tool:/.test(id)), ids.filter(id => /^tool:/.test(id))] : [ids];
        if (lists.some(l => l.length > 12)) flags.add('TOO_MANY_RELATIONS');
      });
      if (broken.length) { flags.add('BROKEN_RELATION'); notes.push(...broken); }
      if (RELATION_EXPECTED[p] && !relIds.length && !(p === 'le' && (e.lifeEvents || []).length && incoming.get(e.id))) flags.add('MISSING_RELATION');
      /* dates */
      const dated = e.startDate || e.endDate || e.applicationStart || e.applicationEnd || e.expiresAt;
      if (TIME_BOUND[e.type] && !dated) flags.add('DATE_VERIFICATION_REQUIRED');
      const checked = Date.parse(e.lastCheckedAt || '');
      if (freshDays[e.type] && e.sourceType !== 'editorial' && checked && now - checked > freshDays[e.type] * 864e5) flags.add('STALE_REVIEW_REQUIRED');
      if (dupCandidate.has(e.id)) flags.add('DUPLICATE_CANDIDATE');
      if (!e.category && !(e.tags || []).length) flags.add('WEAK_SEARCH_METADATA');
      /* specifics without a source */
      const budget = raw.budget || raw.priceLabel || (e.price && e.price.label) || '';
      if (/\d\s*만\s*원|\d{1,3}(,\d{3})+\s*원|\d+\s*원/.test(budget) && !(e.officialUrl || e.sourceUrl)) { flags.add('UNSOURCED_SPECIFIC'); notes.push('budget: ' + budget); }
      /* two fields of one record that contradict each other (never auto-corrected) */
      const AMOUNT = /\d\s*만\s*원|\d{1,3}(,\d{3})+\s*원|\d+\s*원/;
      const priceText = String(raw.price || raw.priceLabel || '');
      if (raw.budget && priceText && ((AMOUNT.test(raw.budget) && /상이|변동|별도/.test(priceText) && !AMOUNT.test(priceText)) || (/^무료$/.test(raw.budget) && AMOUNT.test(priceText) && !/무료/.test(priceText)))) {
        flags.add('FIELD_CONFLICT'); notes.push('budget "' + raw.budget + '" vs price "' + priceText + '"');
      }
      const visibleText = [e.title, sum, e.description, raw.body, raw.blurb].filter(Boolean).join(' ');
      if (/20(2[5-9])년|현재 (운영|모집|신청|접수) ?중/.test(visibleText)) flags.add('TIME_SENSITIVE_CLAIM');
      /* usage */
      const used = [...screens.get(e.id)];
      if (!used.length && !incoming.get(e.id)) flags.add('ORPHAN');
  
      /* ── deterministic score (100) ── */
      let score = 0;
      score += e.title ? 7 : 0; score += L(e.title) >= 2 && L(e.title) <= 30 ? 3 : 0;                                    /* title 10 */
      score += sum ? 10 : 0; score += L(sum) >= 16 && L(sum) <= 100 ? 5 : 0;
      score += flags.has('PLACEHOLDER_SUMMARY') || flags.has('WEAK_SUMMARY') || !sum ? 0 : 25;
      score += flags.has('DUPLICATE_SUMMARY') ? 0 : 5;                                                                        /* summary 45 */
      score += flags.has('MISSING_SOURCE') ? 0 : flags.has('INVALID_URL') ? 7 : 15;                                          /* source 15 */
      score += e.category || (e.domains || []).length ? 5 : 0; score += (e.tags || []).length ? 5 : 0;                       /* search metadata 10 (age: general content is never penalised) */
      score += flags.has('BROKEN_RELATION') ? 0 : 3; score += flags.has('MISSING_RELATION') ? 0 : 7;                         /* relations 10 */
      score += flags.has('DATE_VERIFICATION_REQUIRED') ? 5 : 10;                                                              /* dates 10 */
      if (flags.has('UNSOURCED_SPECIFIC')) score -= 5;
      if (flags.has('TIME_SENSITIVE_CLAIM')) score -= 5;
      if (flags.has('STALE_REVIEW_REQUIRED')) score -= 5;
      if (flags.has('FIELD_CONFLICT')) score -= 5;
      score = Math.max(0, Math.min(100, score));
      const grade = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Needs Review' : 'Poor';
      return {
        id: e.id, type: e.type, kind: PREFIX_KIND[p] || p, title: e.title, summary: sum, category: e.category || null,
        ageGroup: (e.lifeStages || []).length ? e.lifeStages : 'general', lifeStage: e.lifeStages || [], lifeEvent: e.lifeEvents || [],
        tags: e.tags || [], keywords: e.domains || [], source: { name: e.sourceName, type: e.sourceType, class: provenanceClass(e), verification: e.verificationStatus },
        urls: { official: e.officialUrl, source: e.sourceUrl, booking: e.bookingUrl, href: e.href },
        relations: Object.fromEntries(Object.entries(rel).map(([k, v]) => [k, v.length])), incoming: incoming.get(e.id),
        cta: raw.cta || null, dates: { start: e.startDate, end: e.endDate, applicationEnd: e.applicationEnd, lastCheckedAt: e.lastCheckedAt, requiresDateVerification: !!(e.meta && e.meta.requiresDateVerification) },
        screens: used, visible: visible(e.id), score, grade, flags: [...flags], notes,
        /* inspector detail (read-only copies) */
        description: e.description || null, relationIds: JSON.parse(JSON.stringify(rel)), updatedAt: e.updatedAt || null,
        freshness: repo.freshness ? repo.freshness(e) : 'unknown', hiddenReason: repo.hiddenReason(e.id) || null,
        price: raw.price || raw.priceLabel || null, budget: raw.budget || null
      };
    });
  
    /* ── counts ── */
    const count = f => records.reduce((m, r) => { const k = f(r); m[k] = (m[k] || 0) + 1; return m; }, {});
    const byGrade = count(r => r.grade);
    const flagCounts = {}; records.forEach(r => r.flags.forEach(f => { flagCounts[f] = (flagCounts[f] || 0) + 1; }));
    const curated = all.filter(e => !(e.meta && e.meta.upstreamProvider)).length;
  
    /* ── relation audit (topics ↔ topics one-way links; zero-relation guides) ── */
    const oneWay = [];
    all.filter(e => prefix(e) === 'topic').forEach(e => (e.relations.topicIds || []).forEach(t => { const o = byId.get(t); if (o && !(o.relations.topicIds || []).includes(e.id)) oneWay.push(e.id + ' → ' + t); }));
    const lifeStageMatrix = {};
    all.filter(e => e.type === 'lifeStage').forEach(st => {
      const s = st.lifeStages[0], topics = all.filter(e => prefix(e) === 'topic' && e.lifeStages.includes(s));
      const kinds = { policy: 'policyIds', program: 'classIds', service: 'serviceIds', place: 'placeIds', guide: 'contentIds' };
      lifeStageMatrix[s] = { topics: topics.length };
      for (const [k, rk] of Object.entries(kinds)) lifeStageMatrix[s][k] = topics.filter(t => (t.relations[rk] || []).length).length;
    });
    const lifeEvents = all.filter(e => e.type === 'lifeEvent').map(e => ({ id: e.id, title: e.title, stages: e.lifeStages, topics: (e.relations.topicIds || []).length, links: e.meta.topicLinks || null, tagged: all.filter(x => x.type !== 'lifeEvent' && (x.lifeEvents || []).includes(e.id.slice(3))).length }));
  
    /* ── CTA audit ── */
    const ctas = count(r => r.cta || '(screen default)');
    const applyCta = records.filter(r => r.cta && /신청하기/.test(r.cta) && !(r.urls.official || r.urls.booking));
  
    /* ── time-sensitive wording (relative phrases in user checklists are fine; year/“현재 운영” claims are flagged) ── */
    const TIME_WORDS = ['올해', '현재', '최근', '지금', '이번 달', '이번 주', '2025', '2026', '최신', '현재 운영', '현재 신청'];
    const timeWording = {};
    all.forEach(e => { const raw = repo.source(e.id) || {}; const t = JSON.stringify([e.title, e.summary, e.description, raw.body, raw.points, raw.guide, raw.checklist, raw.knowledge]);
      TIME_WORDS.forEach(w => { const n = t.split(w).length - 1; if (n) timeWording[w] = (timeWording[w] || 0) + n; }); });
  
    /* ── search test set ── */
    const search = opts.lite ? [] : SEARCH_SET.map(([q, re]) => {
      const r = S.search(q, {}), top = r.items.slice(0, 5).map(h => h.item);
      const relevant = top.filter(x => re.test([x.title, x.category, (x.tags || []).join(' '), x.desc].join(' '))).length;
      return { q, total: r.total, relevantTop5: relevant, top3: top.slice(0, 3).map(x => x.key + ' ' + x.title) };
    });
    const searchSummary = opts.lite ? null : { queries: search.length, zeroResults: search.filter(s => !s.total).map(s => s.q), weak: search.filter(s => s.total && s.relevantTop5 < 2).map(s => s.q),
      relevantTop5Avg: +(search.reduce((n, s) => n + s.relevantTop5, 0) / search.length).toFixed(2) };
  
    /* ── recommendation scenarios ── */
    const recommendations = opts.lite ? [] : SCENARIOS.map(([name, c, re]) => {
      const r = repo.getRecommendations(Object.assign({ limit: 10 }, c)).items.map(x => x.entity);
      const relevant = r.filter(x => re.test([x.title, (x.tags || []).join(' '), x.category].join(' ')));
      const ageMismatch = r.filter(x => x.lifeStages.length && !x.lifeStages.includes(c.lifeStage));
      return { name, context: c, count: r.length, relevant: relevant.length, ageMismatch: ageMismatch.map(x => x.id), top: r.slice(0, 5).map(x => x.id + ' ' + x.title) };
    });
  
    /* ── detail completeness (title + type + summary at minimum) ── */
    const detailIncomplete = records.filter(r => r.screens.includes('DETAIL') && !(r.title && r.type && r.summary)).map(r => r.id);
  
    return {
      generatedAt: new Date(now).toISOString(),
      totals: { total: records.length, curated, pass: (byGrade.Excellent || 0) + (byGrade.Good || 0), needsReview: byGrade['Needs Review'] || 0, poor: byGrade.Poor || 0, byGrade,
        averageScore: +(records.reduce((n, r) => n + r.score, 0) / records.length).toFixed(1) },
      byType: count(r => r.type), byKind: count(r => r.kind), byProvenance: count(r => r.source.class), bySourceType: count(r => r.source.type),
      screens: ['HOME', 'TODAY', 'LIFE STAGE', 'EXPLORE', 'SEARCH', 'MY LIFE', 'DETAIL', 'COMMUNITY'].reduce((m, s) => { m[s] = records.filter(r => r.screens.includes(s)).length; return m; }, {}),
      orphans: records.filter(r => r.flags.includes('ORPHAN')).map(r => r.id),
      flags: flagCounts,
      duplicates, relations: { oneWayTopicLinks: oneWay.length, lifeStageMatrix, lifeEvents },
      cta: { values: ctas, applyWithoutOfficialPage: applyCta.map(r => r.id) },
      urls: { checked: records.reduce((n, r) => n + Object.values(r.urls).filter(Boolean).length, 0), invalid: records.filter(r => r.flags.includes('INVALID_URL')).map(r => r.id), httpVerified: false },
      dates: { requiresDateVerification: records.filter(r => r.flags.includes('DATE_VERIFICATION_REQUIRED')).map(r => r.id), stale: records.filter(r => r.flags.includes('STALE_REVIEW_REQUIRED')).map(r => r.id) },
      timeWording, search, searchSummary, recommendations, detailIncomplete,
      records
    };
  }


  root.LivonContentQuality = { FLAGS: FLAGS, PROVENANCE: PROVENANCE, SEARCH_SET: SEARCH_SET, SCENARIOS: SCENARIOS, provenanceClass: provenanceClass, evaluate: evaluate };
})(typeof window !== "undefined" ? window : globalThis);
