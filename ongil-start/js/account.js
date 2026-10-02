/*
 * ONGIL account boundary — Phase 1: LOCAL-FIRST, ANONYMOUS-CAPABLE.
 *
 * There is no sign-in and no server in this phase. Everything is kept on this device through storage.js.
 * This module is the one place a Newon+ account will be attached later:
 *
 *   storage.subscribe(change)  ──▶  sync adapter.push(change)        (only after an adapter is connected)
 *
 * A sync adapter is an object { id, isConfigured(), push(change) }. connectSyncAdapter() refuses an adapter
 * that is not configured (fail-closed), so ONGIL stays in local mode until real account infrastructure exists.
 * Connecting never uploads what is already on the device: a first import must be an explicit user choice,
 * designed together with the Newon+ account (see docs/newon/livon-public-anonymous-mode.md).
 *
 * No identity is ever read from storage, the URL or UI input.
 */
import { maySync } from './privacy.js';

export const SYNCABLE_COLLECTIONS = Object.freeze(['profile', 'preferences', 'saved', 'onboarding']);

/* a collection is forwarded only when it is listed above AND privacy.js classifies it as APP */
export function isSyncable(collection) {
  return SYNCABLE_COLLECTIONS.includes(collection) && maySync(collection);
}

export function createAccount({ storage }) {
  let adapter = null;
  let unsubscribe = null;

  function state() {
    return Object.freeze({
      mode: adapter ? 'account' : 'local',
      signedIn: false,
      syncAvailable: !!adapter,
      persistent: storage.persistent,
      adapterId: adapter ? adapter.id : null,
    });
  }

  function connectSyncAdapter(candidate) {
    const valid = candidate && typeof candidate.id === 'string' && typeof candidate.isConfigured === 'function' && typeof candidate.push === 'function';
    if (!valid) return { connected: false, reason: 'INVALID_ADAPTER' };
    let configured = false;
    try {
      configured = candidate.isConfigured() === true;
    } catch {
      configured = false;
    }
    if (!configured) return { connected: false, reason: 'NOT_CONFIGURED' };
    disconnectSyncAdapter();
    adapter = candidate;
    unsubscribe = storage.subscribe((change) => {
      if (!isSyncable(change.collection)) return;
      try {
        const r = adapter.push(change);
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch {
        /* a sync failure never breaks local use */
      }
    });
    return { connected: true };
  }

  function disconnectSyncAdapter() {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
    adapter = null;
  }

  return Object.freeze({ state, connectSyncAdapter, disconnectSyncAdapter });
}
