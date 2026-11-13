/*
 * ONGIL Profile and Preferences — local-first.
 *
 * Profile     nickname · who uses ONGIL · age range · region · interests · needs · family intent
 * Preference  text size · background motion · notification preferences per type
 *
 * No real name, birth date, phone number, address or health information is asked for or stored here.
 */
import { emptyProfile, emptyPreferences, normalizeProfile, normalizePreferences, isPlainObject } from './contracts.js';

export function createProfileStore(storage, { now = () => Date.now() } = {}) {
  function getProfile() {
    const raw = storage.get('profile', null);
    return raw ? normalizeProfile(raw, raw.updatedAt || 0) : emptyProfile();
  }
  function updateProfile(patch) {
    const next = normalizeProfile({ ...getProfile(), ...(isPlainObject(patch) ? patch : {}), updatedAt: now() }, now());
    return { ok: storage.set('profile', next), profile: next };
  }
  function getPreferences() {
    const raw = storage.get('preferences', null);
    return raw ? normalizePreferences(raw, raw.updatedAt || 0) : emptyPreferences();
  }
  function updatePreferences(patch) {
    const current = getPreferences();
    const p = isPlainObject(patch) ? patch : {};
    const merged = {
      ...current,
      ...p,
      notifications: { ...current.notifications, ...(isPlainObject(p.notifications) ? p.notifications : {}) },
      updatedAt: now(),
    };
    const next = normalizePreferences(merged, now());
    return { ok: storage.set('preferences', next), preferences: next };
  }
  function hasProfile() {
    return storage.get('profile', null) !== null;
  }
  return Object.freeze({ getProfile, updateProfile, getPreferences, updatePreferences, hasProfile });
}
