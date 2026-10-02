/*
 * External data sources for ONGIL — the ONLY ONGIL module that may call the network.
 *
 * A source is { id, label, kind, load(params) → { state, items, attribution } } with
 *   state = 'ready' | 'empty' | 'unavailable'
 * 'unavailable' covers everything that is not a usable answer (endpoint missing, provider not configured,
 * timeout, malformed response). It is a normal state, shown as plain words — never as an error dump.
 * Nothing is invented: with no usable answer the item list is empty.
 *
 * Phase 2A source: regional lifelong-learning classes, through the data route that already exists in this
 * repository (GET <api>/api/livon/data, provider "kr-lifelong-class"; server/livon/data/). The route keeps the
 * API key on the server and answers ?action=status with booleans only. Whether a production key is set is not
 * known from the code, so every call first asks the route for its status and gives up quietly otherwise.
 * Only the user's region name (시·도) is sent, and only after the user presses the button.
 */
import { safeText, safeHref, REGIONS } from './contracts.js';

export const SOURCE_STATES = Object.freeze(['ready', 'empty', 'unavailable']);
export const LIFELONG_PROVIDER = 'kr-lifelong-class';
const DATA_PATH = '/api/livon/data';
const TIMEOUT_MS = 8000;
const MAX_ITEMS = 6;

const unavailable = (reason) => ({ state: 'unavailable', reason, items: [], attribution: '' });

function cleanProgram(raw) {
  if (!raw || typeof raw !== 'object' || raw.type !== 'program') return null;
  const title = safeText(raw.title, 120);
  const id = typeof raw.providerId === 'string' ? raw.providerId.trim() : '';
  if (!title || !id) return null;
  const loc = raw.location && typeof raw.location === 'object' ? raw.location : {};
  const schedule = raw.schedule && typeof raw.schedule === 'object' ? raw.schedule : {};
  const contact = raw.contact && typeof raw.contact === 'object' ? raw.contact : {};
  const source = raw.source && typeof raw.source === 'object' ? raw.source : {};
  return {
    id,
    title,
    organizer: safeText(raw.organizer, 80),
    venue: safeText(raw.venue, 80),
    address: safeText(loc.address, 120),
    days: safeText(raw.days, 40),
    time: safeText(raw.timeText, 20),
    period: [safeText(schedule.startAt, 10), safeText(schedule.endAt, 10)].filter(Boolean).join(' ~ '),
    href: /^https:\/\//i.test(String(contact.website || '')) ? safeHref(contact.website) : '',
    attribution: safeText(source.attribution || source.providerName, 160),
  };
}

/*
 * createLifelongClassSource({ apiUrl, fetcher })
 *   apiUrl(path) → absolute or same-origin URL of the data route (the page takes it from the site's API config)
 *   fetcher      → fetch-compatible function; injected so tests never touch the network
 */
export function createLifelongClassSource({ apiUrl, fetcher, timeoutMs = TIMEOUT_MS } = {}) {
  async function getJson(query) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetcher(apiUrl(DATA_PATH) + query, { method: 'GET', headers: { accept: 'application/json' }, credentials: 'omit', signal: controller ? controller.signal : undefined });
      if (!response || !response.ok) return null;
      const body = await response.json();
      return body && typeof body === 'object' && body.ok === true ? body : null;
    } catch {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function load({ region } = {}) {
    if (typeof apiUrl !== 'function' || typeof fetcher !== 'function') return unavailable('NOT_CONNECTED');
    if (!REGIONS.some((r) => r.id === region)) return unavailable('REGION_REQUIRED');
    const status = await getJson('?action=status');
    const provider = status && status.providers && status.providers[LIFELONG_PROVIDER];
    if (!provider || provider.configured !== true) return unavailable('NOT_CONFIGURED');
    const data = await getJson(`?provider=${LIFELONG_PROVIDER}&region=${encodeURIComponent(region)}&status=open&limit=${MAX_ITEMS}`);
    if (!data || !Array.isArray(data.items)) return unavailable('NO_ANSWER');
    const items = data.items.map(cleanProgram).filter(Boolean).slice(0, MAX_ITEMS);
    if (items.length === 0) return { state: 'empty', items: [], attribution: '' };
    return { state: 'ready', items, attribution: items[0].attribution };
  }

  return Object.freeze({ id: 'lifelong-class', label: '평생학습 강좌', kind: 'program', load });
}
