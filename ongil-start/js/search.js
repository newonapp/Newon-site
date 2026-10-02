/*
 * ONGIL Search foundation.
 *
 * A provider is { id, label, search(query) → Result[] | Promise<Result[]> } with
 *   Result = { type, id, title, description, href }
 * createSearch() runs every registered provider, validates what comes back and isolates failures.
 * Nothing here invents results: with no matching provider data the answer is an empty list and the UI
 * shows an empty state.
 *
 * Phase 1 providers (real, local data only):
 *   areas  — ONGIL's own menus and the sections inside them
 *   saved  — what the user has saved on this device
 * Services, programs, places, posts and products get their own providers in later phases.
 */
import { LIMITS, safeText, safeHref } from './contracts.js';

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

function cleanResult(r, providerId) {
  if (!r || typeof r !== 'object') return null;
  const title = safeText(r.title, LIMITS.title);
  const id = safeText(String(r.id ?? ''), LIMITS.id);
  if (!title || !id) return null;
  return {
    providerId,
    type: safeText(r.type, 40) || providerId,
    id,
    title,
    description: safeText(r.description, LIMITS.description),
    href: safeHref(r.href),
  };
}

export function createSearch() {
  const providers = new Map();

  function registerProvider(provider) {
    if (!provider || typeof provider.id !== 'string' || !/^[a-z][a-z0-9-]{1,30}$/.test(provider.id) || typeof provider.search !== 'function') {
      throw new Error('INVALID_PROVIDER');
    }
    providers.set(provider.id, { id: provider.id, label: safeText(provider.label, 40) || provider.id, search: provider.search });
    return () => providers.delete(provider.id);
  }

  async function query(input) {
    const q = normalizeQuery(input);
    const out = { query: q, results: [], groups: [], failed: [] };
    if (!q) return out;
    for (const p of providers.values()) {
      let rows = [];
      try {
        rows = await p.search(q);
      } catch {
        out.failed.push(p.id);
        continue;
      }
      const clean = (Array.isArray(rows) ? rows : []).map((r) => cleanResult(r, p.id)).filter(Boolean).slice(0, 20);
      if (clean.length) out.groups.push({ providerId: p.id, label: p.label, results: clean });
      out.results.push(...clean);
    }
    return out;
  }

  return Object.freeze({ registerProvider, query, providerIds: () => [...providers.keys()] });
}

export function createAreaProvider(areas) {
  return {
    id: 'areas',
    label: '메뉴',
    search(q) {
      const rows = [];
      for (const a of areas) {
        if (matches(q, a.label, a.description, ...(a.keywords || []))) {
          rows.push({ type: 'AREA', id: a.id, title: a.label, description: a.description, href: a.hash });
        }
        for (const m of a.modules || []) {
          if (matches(q, m.title, m.description)) {
            rows.push({ type: 'SECTION', id: `${a.id}.${m.id}`, title: `${a.label} › ${m.title}`, description: m.available ? m.description : `${m.description} (준비 중)`, href: a.hash });
          }
        }
      }
      return rows;
    },
  };
}

export function createSavedProvider(savedStore, typeLabels = {}) {
  return {
    id: 'saved',
    label: '저장한 항목',
    search(q) {
      return savedStore
        .list()
        .filter((it) => matches(q, it.title, it.description))
        .map((it) => ({ type: it.type, id: it.key, title: it.title, description: [typeLabels[it.type], it.description].filter(Boolean).join(' · '), href: it.href || '#saved' }));
    },
  };
}
