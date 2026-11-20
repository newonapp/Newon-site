/*
 * Family Connection V1 — where the family state is kept. Screens and the service never touch storage directly:
 * they are given a FamilyRepository.
 *
 *   FamilyRepository { kind, mode, available, load() → FamilyState, save(state) → boolean, clear() → boolean }
 *
 *   createLocalFamilyRepository(storage)   this device only (collection "family", class PRIVATE: never synced,
 *                                          searched, saved or counted). This is what V1 runs on.
 *   createRemoteFamilyRepository()         a whole-state account repository. It refuses every call with ACCOUNT_REQUIRED
 *                                          and sends nothing: V2 does not load or save the family document on a server.
 *                                          The account side is family-remote.js (one operation per request).
 *
 * FAMILY_REMOTE_CONTRACT is the API of the V2 server (server/ongil/family). Rule for that server: filter by the same
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

/*
 * Family Connection V2: the account server exists in code (server/ongil/family, /api/ongil/family) and is reached through
 * family-remote.js — one operation at a time, never by uploading this device's family document. It answers only when
 * ONGIL_FAMILY_REMOTE_ENABLED, a database, Newon+ token verification and (in production) rate-limit protection are all
 * configured: CODE READY, not live. createRemoteFamilyRepository above stays refusing on purpose (a whole-state
 * load/save is not how the account side works, and LOCAL connections are never copied to an account automatically).
 */
const route = (op, who, does) => Object.freeze({ method: op === 'overview' || op === 'status' ? 'GET' : 'POST', path: '/api/ongil/family', op, who, does });
export const FAMILY_REMOTE_CONTRACT = Object.freeze({
  status: 'CODE_READY',
  auth: 'the Newon+ ID token of the signed-in account, in the Authorization header — the owner and each member are separate accounts',
  routes: Object.freeze([
    route('status', 'ANYONE', 'which switches are on (booleans only) — no sign-in, no data'),
    route('overview', 'SIGNED_IN', 'my family group (members, invitations, requests) and the groups I am a member of'),
    route('createInvitation', 'OWNER', 'create an invitation: the code is returned once; only its hash is stored'),
    route('revokeInvitation', 'OWNER', 'revoke a pending invitation'),
    route('inspectInvitation', 'INVITEE', 'read what a connection means — no shared data, code in the body only'),
    route('acceptInvitation', 'INVITEE', 'accept: creates the membership with NO permission'),
    route('declineInvitation', 'INVITEE', 'decline'),
    route('setPermissions', 'OWNER', 'set levels per category; sensitive categories carry the consent'),
    route('stopSharing', 'OWNER', 'stop sharing with one member (the connection stays)'),
    route('stopAllSharing', 'OWNER', 'stop sharing with every member'),
    route('disconnect', 'OWNER', 'disconnect: all access ends at once'),
    route('leave', 'MEMBER', 'a member ends the connection'),
    route('publishSnapshot', 'OWNER', 'send the short lines a member may see — the server keeps only what is allowed now'),
    route('viewShared', 'MEMBER', 'what the owner allows — filtered on the server at every read'),
    route('requestHelp', 'OWNER', 'ask one member for help'),
    route('moveHelp', 'OWNER|MEMBER', 'move a request to an allowed next state'),
    route('activity', 'OWNER', 'the activity log (actions only, never shared values)'),
  ]),
});
