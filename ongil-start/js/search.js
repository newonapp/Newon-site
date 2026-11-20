/*
 * ONGIL Search — one registry, one result contract (Phase 8).
 *
 * Global search is PUBLIC DISCOVERY: ONGIL's menus, what the user saved from public sources, and public items the
 * screens actually loaded during this visit. It is not a search over the user's records.
 *
 *   Provider  { id, label, scope, supportedTypes[], search(query) → raw[] | Promise<raw[]> }
 *             scope is required: 'PUBLIC' or 'LOCAL_PRIVATE'. A LOCAL_PRIVATE provider can be registered (so a later
 *             "search my own records" screen has a place to hang) but query() never runs it.
 *   Result    { providerId, scope, type, contentType, typeLabel, id, title, description, source, route, href }
 *             type is what the provider called it (CLASS, CARE_SERVICE, AREA …); contentType is the canonical content
 *             type (routes.js: CLASS → PROGRAM), '' for menus; typeLabel is the word a person reads;
 *             route is always inside ONGIL — the owner screen of the type — and href is the same value (older callers).
 *             A provider's raw answer never reaches the screen: only these fields, bounded and cleaned.
 *
 * Providers (all PUBLIC):
 *   areas  — ONGIL's menus and the sections inside them
 *   saved  — saved public items (서비스, 혜택, 기관, 프로그램, 장소, 상품). Saved posts are LOCAL_ONLY and left out.
 *   care   — care items loaded on 돌봄·서비스 this visit
 *   enjoy  — 즐길거리 items loaded this visit
 *   store  — products loaded on 스토어 this visit (none in production: no product source is connected)
 * There is no provider for check-ins, symptoms, medication, health notes, the journal, expenses, family settings,
 * help requests, community posts, drafts, the calendar, tasks or routines.
 *
 * One provider failing never fails the search: its id is reported in `failed` and the others still answer.
 * Nothing is invented: no suggested, popular or trending queries exist.
 */
import { LIMITS, safeText, savedSyncPolicy } from './contracts.js';
import { productCategoryById } from './store-contracts.js';
import { SCOPES, PUBLIC_CONTENT_TYPES, contentType, typeLabel, ownerRoute, safeRoute, moduleRoute } from './routes.js';

export const SEARCH_GROUP_LIMIT = 20;
export const SEARCH_STATES = Object.freeze(['empty-query', 'results', 'partial', 'no-results', 'error']);

export function normalizeQuery(q) {
  return safeText(typeof q === 'string' ? q : '', LIMITS.query);
}

function fold(s) {
  return String(s || '').toLowerCase().replace(/[\s·]+/g, '');
}
export function matches(query, ...fields) {
  const q = fold(query);
  return q !== '' && fields.some((f) => fold(f).includes(q));
}

/* raw provider row → SearchResult, or null. The route is recomputed here: a provider cannot send the user outside ONGIL. */
function cleanResult(r, provider) {
  if (!r || typeof r !== 'object') return null;
  const title = safeText(r.title, LIMITS.title);
  const id = safeText(String(r.id ?? ''), LIMITS.id);
  if (!title || !id) return null;
  const rawType = safeText(r.type, 40);
  const content = contentType(rawType);
  const hint = safeRoute(r.route || r.href);
  /* a saved item opens the Saved screen; a content item opens its owner screen; a menu entry opens what it names */
  const route = provider.id === 'saved' ? '#saved' : content ? ownerRoute(content, hint) : hint;
  return {
    providerId: provider.id,
    scope: provider.scope,
    type: rawType || provider.id,
    contentType: content,
    typeLabel: typeLabel(content || rawType),
    id,
    title,
    description: safeText(r.description, LIMITS.description),
    source: safeText(r.source, LIMITS.source),
    route,
    href: route,
  };
}

export function createSearch() {
  const providers = new Map();

  function registerProvider(provider) {
    if (!provider || typeof provider.id !== 'string' || !/^[a-z][a-z0-9-]{1,30}$/.test(provider.id) || typeof provider.search !== 'function' || !SCOPES.includes(provider.scope)) {
      throw new Error('INVALID_PROVIDER');
    }
    const supportedTypes = Object.freeze((Array.isArray(provider.supportedTypes) ? provider.supportedTypes : []).filter((t) => typeof t === 'string').slice(0, 20));
    providers.set(provider.id, Object.freeze({ id: provider.id, label: safeText(provider.label, 40) || provider.id, scope: provider.scope, supportedTypes, search: provider.search }));
    return () => providers.delete(provider.id);
  }

  /*
   * state: 'empty-query' · 'results' · 'partial' (some providers failed, others answered) · 'no-results' · 'error'
   * (every provider that ran failed). `total` counts what was found; `results` holds at most SEARCH_GROUP_LIMIT per
   * provider, and a group says when it was cut (`truncated`), so a count on screen is never larger than what is shown.
   */
  async function query(input, { only = null } = {}) {
    const q = normalizeQuery(input);
    const out = { query: q, state: 'empty-query', results: [], groups: [], failed: [], failedLabels: [], total: 0 };
    if (!q) return out;
    let ran = 0;
    for (const p of providers.values()) {
      if (p.scope !== 'PUBLIC') continue;
      /* Phase 10: a caller may ask a subset of the PUBLIC providers by id (ONGIL 도우미 asks one at a time) */
      if (Array.isArray(only) && !only.includes(p.id)) continue;
      ran += 1;
      let rows = [];
      try {
        rows = await p.search(q);
      } catch {
        out.failed.push(p.id);
        out.failedLabels.push(p.label);
        continue;
      }
      const all = (Array.isArray(rows) ? rows : []).map((r) => cleanResult(r, p)).filter(Boolean);
      const clean = all.slice(0, SEARCH_GROUP_LIMIT);
      out.total += all.length;
      if (clean.length) out.groups.push({ providerId: p.id, label: p.label, results: clean, found: all.length, truncated: all.length > clean.length });
      out.results.push(...clean);
    }
    if (out.results.length) out.state = out.failed.length ? 'partial' : 'results';
    else out.state = out.failed.length && out.failed.length === ran ? 'error' : out.failed.length ? 'partial' : 'no-results';
    return out;
  }

  return Object.freeze({
    registerProvider,
    query,
    providerIds: () => [...providers.keys()],
    /* the registry, without the search functions */
    providers: () => [...providers.values()].map((p) => ({ id: p.id, label: p.label, scope: p.scope, supportedTypes: [...p.supportedTypes] })),
  });
}

export function createAreaProvider(areas) {
  return {
    id: 'areas',
    label: '메뉴',
    scope: 'PUBLIC',
    supportedTypes: ['AREA', 'SECTION'],
    search(q) {
      const rows = [];
      for (const a of areas) {
        if (matches(q, a.label, a.description, ...(a.keywords || []))) {
          rows.push({ type: 'AREA', id: a.id, title: a.label, description: a.description, route: a.hash });
        }
        for (const m of a.modules || []) {
          if (matches(q, m.title, m.description)) {
            /* a section that has its own address opens there; the rest open their area */
            rows.push({ type: 'SECTION', id: `${a.id}.${m.id}`, title: `${a.label} › ${m.title}`, description: m.available ? m.description : `${m.description} (준비 중)`, route: m.available ? moduleRoute(a, m.id) : a.hash });
          }
        }
      }
      return rows;
    },
  };
}

/* saved PUBLIC items only: a saved community post is the user's own writing (LOCAL_ONLY) and is never searched */
export function createSavedProvider(savedStore, typeLabels = {}) {
  return {
    id: 'saved',
    label: '저장한 항목',
    scope: 'PUBLIC',
    supportedTypes: [...PUBLIC_CONTENT_TYPES],
    search(q) {
      return savedStore
        .list()
        .filter((it) => savedSyncPolicy(it) === 'SYNCABLE' && matches(q, it.title, it.description))
        .map((it) => ({ type: it.type, id: it.key, title: it.title, description: [typeLabels[it.type], it.description].filter(Boolean).join(' · '), source: it.source, route: '#saved' }));
    },
  };
}

/* getItems() → the care items the screen has loaded (public information only; nothing personal is ever passed here) */
export function createCareProvider(getItems) {
  return {
    id: 'care',
    label: '돌봄·서비스',
    scope: 'PUBLIC',
    supportedTypes: ['SERVICE', 'BENEFIT', 'FACILITY'],
    search(q) {
      const items = typeof getItems === 'function' ? getItems() : [];
      return (Array.isArray(items) ? items : [])
        .filter((it) => it && ['CARE_SERVICE', 'PUBLIC_BENEFIT', 'FACILITY'].includes(it.type) && matches(q, it.title, it.summary, it.address))
        .map((it) => ({ type: it.type, id: `${it.type}:${it.id}`, title: it.title, description: [it.address || it.summary, it.sourceName].filter(Boolean).join(' · '), source: it.sourceName, route: it.type === 'FACILITY' ? '#care/facility' : `#care/${it.category}` }));
    },
  };
}

/* getItems() → the 즐길거리 items the screen has loaded (public information only) */
export function createEnjoyProvider(getItems) {
  const LABELS = { PROGRAM: '프로그램', CLASS: '강좌', EVENT: '행사', PLACE: '장소' };
  return {
    id: 'enjoy',
    label: '즐길거리',
    scope: 'PUBLIC',
    supportedTypes: ['PROGRAM', 'PLACE'],
    search(q) {
      const items = typeof getItems === 'function' ? getItems() : [];
      return (Array.isArray(items) ? items : [])
        .filter((it) => it && LABELS[it.type] && matches(q, it.title, it.summary, it.organization, it.location, it.address))
        .map((it) => ({ type: it.type, id: `${it.type}:${it.id}`, title: it.title, description: [LABELS[it.type], it.organization || it.address, it.sourceName].filter(Boolean).join(' · '), source: it.sourceName, route: `#enjoy/${String(it.category || '').toLowerCase()}` }));
    },
  };
}

/* getItems() → the products the 스토어 screen has loaded (public information only) */
export function createStoreProvider(getItems) {
  return {
    id: 'store',
    label: '상품',
    scope: 'PUBLIC',
    supportedTypes: ['PRODUCT'],
    search(q) {
      const items = typeof getItems === 'function' ? getItems() : [];
      return (Array.isArray(items) ? items : [])
        .filter((it) => it && typeof it.id === 'string' && matches(q, it.name, it.summary, it.brand, ...(Array.isArray(it.features) ? it.features : [])))
        .map((it) => ({ type: 'PRODUCT', id: `PRODUCT:${it.id}`, title: it.name, description: ['상품', it.brand, it.sellerName].filter(Boolean).join(' · '), source: it.sourceName || it.sellerName, route: productCategoryById(it.category) ? `#store/${productCategoryById(it.category).slug}` : '#store' }));
    },
  };
}
