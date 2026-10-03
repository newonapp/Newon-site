/*
 * Data classification — every stored collection has exactly one class, and the class decides what may
 * ever leave this device.
 *
 *   APP              profile, preferences, onboarding, saved, notifications — settings and bookmarks
 *   STANDARD         everyday records: calendar events, tasks, routines (+ logs), daily life, sleep
 *   PRIVATE          living expenses, the journal, family-sharing choices and help-request notes — the user's money,
 *                    the user's own writing, and decisions about other people; also (Phase 6) the user's own community
 *                    posts and group/meetup drafts — local writing that has not been, and cannot yet be, published
 *   HEALTH_ADJACENT  check-ins, medication (+ logs), symptoms, health notes and health measures — not medical records, but close enough
 *                    to be treated with care. A future sync of these needs its own explicit consent (see PHASE_3 doc).
 *
 *   OPERATIONAL       (Phase 9) daily counters of which screens and features were used — numbers only, kept 14 days,
 *                    shown on the local operations view. Never synced, searched or shared.
 *
 * Rules enforced here and checked by tests:
 *   - PRIVATE and HEALTH_ADJACENT collections are never syncable, never searchable, never shareable with family.
 *   - STANDARD collections are local-only for now as well; they may become syncable later, with consent.
 *   - Only APP collections that account.js lists are forwarded to a sync adapter.
 *   - No personal record of any class is offered to global search.
 */
import { COLLECTIONS } from './storage.js';
import { isHealthEvent } from './life-contracts.js';

export const DATA_CLASSES = Object.freeze(['APP', 'STANDARD', 'PRIVATE', 'HEALTH_ADJACENT', 'OPERATIONAL']);

export const CLASSIFICATION = Object.freeze({
  profile: 'APP',
  preferences: 'APP',
  onboarding: 'APP',
  saved: 'APP',
  notifications: 'APP',
  events: 'STANDARD',
  tasks: 'STANDARD',
  routines: 'STANDARD',
  routineLogs: 'STANDARD',
  dailyLife: 'STANDARD',
  sleepRecords: 'STANDARD',
  expenses: 'PRIVATE',
  journal: 'PRIVATE',
  checkins: 'HEALTH_ADJACENT',
  medications: 'HEALTH_ADJACENT',
  medicationLogs: 'HEALTH_ADJACENT',
  symptoms: 'HEALTH_ADJACENT',
  healthNotes: 'HEALTH_ADJACENT',
  healthMeasures: 'HEALTH_ADJACENT',
  familySharing: 'PRIVATE',
  helpRequests: 'PRIVATE',
  communityPosts: 'PRIVATE',
  groupDrafts: 'PRIVATE',
  meetupDrafts: 'PRIVATE',
  /* Phase 9: usage counters (analytics.js). Counts of events only — no content, no identifier. Device only: never synced, searched or shared. */
  analytics: 'OPERATIONAL',
});

export const CONTRACT_CLASSES = Object.freeze({
  CalendarEvent: 'STANDARD',
  Task: 'STANDARD',
  Routine: 'STANDARD',
  RoutineLog: 'STANDARD',
  DailyLife: 'STANDARD',
  SleepRecord: 'STANDARD',
  ExpenseRecord: 'PRIVATE',
  JournalEntry: 'PRIVATE',
  Medication: 'HEALTH_ADJACENT',
  MedicationLog: 'HEALTH_ADJACENT',
  CheckIn: 'HEALTH_ADJACENT',
  SymptomRecord: 'HEALTH_ADJACENT',
  HealthNote: 'HEALTH_ADJACENT',
  HealthMeasure: 'HEALTH_ADJACENT',
  FamilySharingPreference: 'PRIVATE',
  HelpRequest: 'PRIVATE',
  CommunityPost: 'PRIVATE',
  GroupDraft: 'PRIVATE',
  MeetupDraft: 'PRIVATE',
});

export function classOf(collection) {
  return Object.prototype.hasOwnProperty.call(CLASSIFICATION, collection) ? CLASSIFICATION[collection] : null;
}

/* a collection may be handed to a sync adapter only if it is an APP collection; anything else needs a consent design first */
export function maySync(collection) {
  return classOf(collection) === 'APP';
}
export function maySearchGlobally(collection) {
  return collection === 'saved';
}
export function familySharingAllowed() {
  return false;
}

/*
 * Completion V2: a 병원 일정 or 건강검진 is a CalendarEvent kept in the STANDARD `events` collection (one calendar), but
 * the record itself is HEALTH_ADJACENT. Whatever later syncs, searches or shares calendar events reads this first and
 * leaves these out; today nothing does (events are local-only, global search has no calendar provider, family sharing
 * is off).
 */
export function eventClass(event) {
  return isHealthEvent(event) ? 'HEALTH_ADJACENT' : 'STANDARD';
}
export function eventShareableWithFamily(event) {
  return familySharingAllowed() && !isHealthEvent(event);
}

export function unclassified() {
  return COLLECTIONS.filter((c) => classOf(c) === null);
}
