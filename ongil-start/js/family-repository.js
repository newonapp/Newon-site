/*
 * Family Connection V1 — where the family state is kept. Screens and the service never touch storage directly:
 * they are given a FamilyRepository.
 *
 *   FamilyRepository { kind, mode, available, load() → FamilyState, save(state) → boolean, clear() → boolean }
 *
 *   createLocalFamilyRepository(storage)   this device only (collection "family", class PRIVATE: never synced,
 *                                          searched, saved or counted). This is what V1 runs on.
 *   createRemoteFamilyRepository()         the account server. NOT AVAILABLE: there is no production account or
 *                                          family backend. Every call refuses with ACCOUNT_REQUIRED and nothing is
 *                                          sent anywhere. It exists so the contract is written down and tested.
 *
 * FAMILY_REMOTE_CONTRACT is the API the future server must offer. Rule for that server: filter by the same
 * permission rules (family-permissions.js) before answering — hiding a field in a screen is not access control.
 */
import { normalizeFamilyState, emptyFamilyState, FAMILY_MODE } from './family-domain.js';

export const FAMILY_COLLECTION = 'family';

export function createLocalFamilyRepository(storage, { now = () => Date.now() } = {}) {
  function load() {
    return normalizeFamilyState(storage.get(FAMILY_COLLECTION, null), now());
  }
  /* what is written is what a later load() would accept: nothing unreadable is ever stored */
  function save(state) {
    return storage.set(FAMILY_COLLECTION, normalizeFamilyState(state, now())) === true;
  }
  return Object.freeze({ kind: 'local', mode: FAMILY_MODE.LOCAL, available: true, load, save, clear: () => storage.remove(FAMILY_COLLECTION) });
}

export class FamilyRepositoryUnavailable extends Error {
  constructor() {
    super('ACCOUNT_REQUIRED');
    this.code = 'ACCOUNT_REQUIRED';
  }
}
export function createRemoteFamilyRepository() {
  const refuse = () => {
    throw new FamilyRepositoryUnavailable();
  };
  return Object.freeze({ kind: 'remote', mode: FAMILY_MODE.ACCOUNT_REQUIRED, available: false, load: refuse, save: refuse, clear: refuse, empty: emptyFamilyState });
}

/* the only repository that can be chosen today */
export function selectFamilyRepository({ storage, now }) {
  return createLocalFamilyRepository(storage, { now });
}

const route = (method, path, who, does) => Object.freeze({ method, path, who, does });
export const FAMILY_REMOTE_CONTRACT = Object.freeze({
  status: 'NOT_IMPLEMENTED',
  auth: 'the Newon+ ID token of the signed-in account, in the Authorization header — the owner and each member are separate accounts',
  routes: Object.freeze([
    route('POST', '/api/ongil/family/invitations', 'OWNER', 'create an invitation (code + expiry)'),
    route('DELETE', '/api/ongil/family/invitations/{id}', 'OWNER', 'revoke a pending invitation'),
    route('POST', '/api/ongil/family/invitations/inspect', 'INVITEE', 'read who invites and what a connection means — no shared data'),
    route('POST', '/api/ongil/family/invitations/accept', 'INVITEE', 'accept: creates member + connection with NO permission'),
    route('POST', '/api/ongil/family/invitations/decline', 'INVITEE', 'decline'),
    route('PUT', '/api/ongil/family/members/{id}/permissions', 'OWNER', 'set levels per category; sensitive categories carry the consent'),
    route('DELETE', '/api/ongil/family/members/{id}/permissions', 'OWNER', 'stop sharing with one member'),
    route('DELETE', '/api/ongil/family/members/{id}', 'OWNER', 'disconnect: all future access ends at once'),
    route('GET', '/api/ongil/family/shared', 'MEMBER', 'the snapshot the owner allows — filtered on the server'),
    route('POST', '/api/ongil/family/requests', 'OWNER', 'ask one member for help'),
    route('PATCH', '/api/ongil/family/requests/{id}', 'OWNER|MEMBER', 'move a request to an allowed next state'),
    route('GET', '/api/ongil/family/activity', 'OWNER', 'the activity log (actions only, never shared values)'),
  ]),
});
