/*
 * Family Connection V2 — the account side of family connection (client). Talks to /api/ongil/family only.
 *
 *   Modes (resolveMode):
 *     ANONYMOUS_LOCAL                    no Newon+ sign-in on this page → V1 LOCAL only (this device). Nothing is sent.
 *     AUTHENTICATED_REMOTE_UNAVAILABLE   signed in, but the family server is off, not configured or unreachable.
 *     AUTHENTICATED_REMOTE_READY         signed in and the server says every switch is on: cross-device family works.
 *
 *   What leaves this device, and only after the owner chose it: invitation details (name the owner uses, relationship,
 *   role, expiry), sharing levels per member, the short lines of a category the member may see (built by the V1 readers),
 *   help requests. Never: the local family document, health records, notes, the journal, expenses or any other
 *   collection. There is no automatic copy of V1 LOCAL connections to the account (they are separate on purpose).
 *
 *   Security: the Newon+ ID token goes in the Authorization header only (never a URL, never stored, never logged);
 *   an invitation code goes in a request body only; the server decides who the caller is from the token.
 */
import { SHARING_CATEGORIES } from './family-domain.js';

export const FAMILY_REMOTE_MODES = Object.freeze({ ANONYMOUS_LOCAL: 'ANONYMOUS_LOCAL', REMOTE_UNAVAILABLE: 'AUTHENTICATED_REMOTE_UNAVAILABLE', REMOTE_READY: 'AUTHENTICATED_REMOTE_READY' });
export const FAMILY_API_PATH = '/api/ongil/family';
const TIMEOUT_MS = 8000;
const fail = (reason, message = '') => ({ ok: false, reason, message });

/* what a member may be shown for each category (levels from the server) → the items to publish, from the V1 readers */
export function snapshotItems(readers, levels, date) {
  const items = [];
  for (const c of SHARING_CATEGORIES) {
    const level = levels && levels[c.id];
    if (c.id === 'HELP_REQUEST' || !level || level === 'NONE' || typeof readers[c.id] !== 'function') continue;
    const lines = readers[c.id](level, date).filter((l) => typeof l === 'string' && l).slice(0, 10);
    if (lines.length) items.push({ category: c.id, level, lines });
  }
  return items;
}

/*
 * createFamilyRemote({ auth, apiUrl, fetcher })
 *   auth     the page's Newon+ auth (window.NewonAuth: getState().status, getIdToken()) or null when the page has none
 *   apiUrl   path → URL (window.LivonApi.url) — the same API base the rest of ONGIL uses
 *   fetcher  the browser's fetch, handed in by app.js
 */
export function createFamilyRemote({ auth = null, apiUrl = null, fetcher = null, timeoutMs = TIMEOUT_MS } = {}) {
  const usable = typeof apiUrl === 'function' && typeof fetcher === 'function';
  const signedIn = () => {
    try { return !!auth && typeof auth.getState === 'function' && auth.getState().status === 'authenticated' && typeof auth.getIdToken === 'function'; } catch { return false; }
  };

  async function send(method, { body = null, query = '', withToken = true } = {}) {
    if (!usable) return fail('UNAVAILABLE');
    const headers = { accept: 'application/json' };
    if (withToken) {
      let token = '';
      try { token = await auth.getIdToken(); } catch { token = ''; }
      if (!token) return fail('NOT_SIGNED_IN');
      headers.authorization = `Bearer ${token}`;
    }
    if (body) headers['content-type'] = 'application/json';
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetcher(apiUrl(FAMILY_API_PATH) + query, { method, headers, body: body ? JSON.stringify(body) : undefined, credentials: 'omit', cache: 'no-store', signal: controller ? controller.signal : undefined });
      let data = null;
      try { data = await response.json(); } catch { data = null; }
      if (!data || typeof data !== 'object') return fail('UNAVAILABLE');
      if (!response.ok || data.ok !== true) return { ok: false, reason: typeof data.code === 'string' ? data.code : 'UNAVAILABLE', message: typeof data.error === 'string' ? data.error : '', categories: Array.isArray(data.categories) ? data.categories : undefined };
      return data;
    } catch {
      return fail('UNAVAILABLE');
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  const op = (name, payload = {}) => send('POST', { body: { op: name, payload } });

  /* the mode is asked for, never assumed: a page without sign-in is LOCAL, and "ready" is what the server says */
  async function resolveMode() {
    if (!signedIn()) return FAMILY_REMOTE_MODES.ANONYMOUS_LOCAL;
    const status = await send('GET', { query: '?op=status', withToken: false });
    return status.ok === true && status.ready === true ? FAMILY_REMOTE_MODES.REMOTE_READY : FAMILY_REMOTE_MODES.REMOTE_UNAVAILABLE;
  }

  return Object.freeze({
    resolveMode,
    overview: () => send('GET'),
    createInvitation: (input) => op('createInvitation', input),
    revokeInvitation: (invitationId) => op('revokeInvitation', { invitationId }),
    inspectInvitation: (code) => op('inspectInvitation', { code }),
    acceptInvitation: (code, ownerLabel) => op('acceptInvitation', { code, ownerLabel }),
    declineInvitation: (code) => op('declineInvitation', { code }),
    setPermissions: (memberId, levels, consents = []) => op('setPermissions', { memberId, levels, consents }),
    stopSharing: (memberId) => op('stopSharing', { memberId }),
    stopAllSharing: () => op('stopAllSharing', {}),
    disconnect: (memberId) => op('disconnect', { memberId }),
    leave: (memberId) => op('leave', { memberId }),
    publish: (memberId, items) => op('publishSnapshot', { memberId, items }),
    viewShared: (memberId) => op('viewShared', { memberId }),
    requestHelp: (memberId, kind, message) => op('requestHelp', { memberId, kind, message }),
    moveHelp: (requestId, to) => op('moveHelp', { requestId, to }),
    activity: () => op('activity', {}),
  });
}
