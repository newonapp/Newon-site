/*
 * ONGIL Onboarding — state only (the dialog UI is onboarding-view.js).
 *
 * One question per step, every step can be passed without answering, and the whole flow can be left at any
 * time ("나중에 하기"). Answers are a draft until complete(); only then are they written to Profile/Preferences.
 * Everything can be changed later in 내 정보.
 *
 * Family: there is no family-connection backend. Choosing "지금 연결" only records the wish (familyIntent);
 * familyConnection() always reports that connecting is not available yet. No connection is ever simulated.
 */
import { USAGE_MODES, AGE_RANGES, REGIONS, INTERESTS, NEEDS, NOTIFICATION_PRESETS, FAMILY_INTENTS, SCHEMA_VERSION, notificationPreset, isPlainObject } from './contracts.js';

export const STEPS = Object.freeze(['welcome', 'usage', 'age', 'region', 'interests', 'needs', 'notifications', 'family', 'complete']);
export const QUESTION_STEPS = Object.freeze(STEPS.filter((s) => s !== 'welcome' && s !== 'complete'));
export const STATUSES = Object.freeze(['new', 'in_progress', 'skipped', 'completed']);

const SINGLE = { usage: USAGE_MODES, age: AGE_RANGES, region: REGIONS, notifications: NOTIFICATION_PRESETS, family: FAMILY_INTENTS };
const MULTI = { interests: INTERESTS, needs: NEEDS };
const ids = (list) => list.map((x) => x.id);

export function emptyAnswers() {
  return { usage: '', age: '', region: '', interests: [], needs: [], notifications: '', family: '' };
}

function cleanAnswers(input) {
  const src = isPlainObject(input) ? input : {};
  const out = emptyAnswers();
  for (const step of Object.keys(SINGLE)) if (ids(SINGLE[step]).includes(src[step])) out[step] = src[step];
  for (const step of Object.keys(MULTI)) if (Array.isArray(src[step])) out[step] = ids(MULTI[step]).filter((id) => src[step].includes(id));
  return out;
}

export function familyConnection() {
  return Object.freeze({ available: false, status: 'NOT_AVAILABLE' });
}

export function createOnboarding({ storage, profile, now = () => Date.now() }) {
  function read() {
    const raw = storage.get('onboarding', null);
    const src = isPlainObject(raw) ? raw : {};
    const status = STATUSES.includes(src.status) ? src.status : 'new';
    const stepIndex = Number.isInteger(src.stepIndex) && src.stepIndex >= 0 && src.stepIndex < STEPS.length ? src.stepIndex : 0;
    return {
      schemaVersion: SCHEMA_VERSION,
      status,
      stepIndex,
      answers: cleanAnswers(src.answers),
      completedAt: Number.isSafeInteger(src.completedAt) ? src.completedAt : 0,
      updatedAt: Number.isSafeInteger(src.updatedAt) ? src.updatedAt : 0,
    };
  }
  function write(state) {
    const next = { ...state, updatedAt: now() };
    storage.set('onboarding', next);
    return view(next);
  }
  function view(s) {
    return { ...s, step: STEPS[s.stepIndex], totalQuestions: QUESTION_STEPS.length, questionNumber: Math.max(0, QUESTION_STEPS.indexOf(STEPS[s.stepIndex]) + 1) };
  }

  function state() {
    return view(read());
  }

  /* opens the flow: a new or skipped flow resumes where it was; a completed one restarts from the first question with current answers */
  function start() {
    const s = read();
    if (s.status === 'completed') {
      const p = profile.getProfile();
      return write({
        ...s,
        status: 'in_progress',
        stepIndex: 1,
        answers: cleanAnswers({ usage: p.usageMode, age: p.ageRange, region: p.region, interests: p.interests, needs: p.needs, notifications: s.answers.notifications, family: p.familyIntent }),
      });
    }
    return write({ ...s, status: 'in_progress', stepIndex: s.stepIndex >= STEPS.length - 1 ? 0 : s.stepIndex });
  }

  function answer(step, value) {
    const s = read();
    const answers = { ...s.answers };
    if (SINGLE[step]) {
      if (value !== '' && !ids(SINGLE[step]).includes(value)) return { ok: false, reason: 'INVALID_ANSWER', state: view(s) };
      answers[step] = value;
    } else if (MULTI[step]) {
      if (!Array.isArray(value)) return { ok: false, reason: 'INVALID_ANSWER', state: view(s) };
      answers[step] = ids(MULTI[step]).filter((id) => value.includes(id));
    } else {
      return { ok: false, reason: 'UNKNOWN_STEP', state: view(s) };
    }
    return { ok: true, state: write({ ...s, status: s.status === 'completed' ? 'completed' : 'in_progress', answers }) };
  }

  function next() {
    const s = read();
    const last = STEPS.length - 1;
    if (s.stepIndex >= last - 1) return complete();
    return write({ ...s, status: 'in_progress', stepIndex: s.stepIndex + 1 });
  }
  function back() {
    const s = read();
    return write({ ...s, stepIndex: Math.max(0, s.stepIndex - 1) });
  }

  /* leave for now: the draft is kept, nothing is applied to the profile */
  function skip() {
    const s = read();
    if (s.status === 'completed') return view(s);
    return write({ ...s, status: 'skipped' });
  }

  function complete() {
    const s = read();
    const a = s.answers;
    profile.updateProfile({ usageMode: a.usage, ageRange: a.age, region: a.region, interests: a.interests, needs: a.needs, familyIntent: a.family });
    if (a.notifications) profile.updatePreferences({ notifications: notificationPreset(a.notifications) });
    return write({ ...s, status: 'completed', stepIndex: STEPS.length - 1, completedAt: now() });
  }

  function reset() {
    storage.remove('onboarding');
    return state();
  }

  return Object.freeze({ state, start, answer, next, back, skip, complete, reset, familyConnection });
}
