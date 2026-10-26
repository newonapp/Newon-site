/*
 * Instrumentation (Phase 9) — the ONE place where product events are counted.
 *
 * Screens and stores do not call analytics themselves. app.js wraps the stores once with the functions below and
 * hands the wrapped stores to the screens, so every "something was created / saved / changed" passes through here.
 * A wrapper calls the real method, returns its result unchanged, and counts an event only when it succeeded.
 *
 * What is passed to track() is decided here and nowhere else: an event name and, at most, a content TYPE.
 * A record's text, title, name, amount, date, status or id is never read.
 * A failing track() is swallowed: instrumentation can not change what a feature does.
 */
import { contentType } from './routes.js';

const safe = (track) => (name, props, screen) => {
  try {
    track(name, props, screen);
  } catch {
    /* analytics never breaks a feature */
  }
};
const ok = (r) => r === true || (r && typeof r === 'object' && r.ok === true);
/* same methods, same results; `after[method](result, args)` runs when the call succeeded */
function wrap(store, after) {
  const out = { ...store };
  for (const [method, fn] of Object.entries(after)) {
    if (typeof store[method] !== 'function') continue;
    out[method] = (...args) => {
      const result = store[method](...args);
      if (ok(result)) fn(result, args);
      return result;
    };
  }
  return Object.freeze(out);
}
const typeOf = (value) => contentType(value && typeof value === 'object' ? value.type : value) || '';

export function createInstrumentation(trackFn) {
  const track = safe(trackFn);
  return Object.freeze({
    track,
    saved: (store) =>
      wrap(store, {
        save: (r, [input]) => { if (!r.already) track('saved_add', { contentType: typeOf(input) }); },
        unsave: (r, [type]) => track('saved_remove', { contentType: typeOf(type) }),
        toggle: (r, [input]) => track(r.saved ? 'saved_add' : 'saved_remove', { contentType: typeOf(input) }),
      }),
    checkIn: (store) => wrap(store, { set: () => track('checkin_saved'), save: () => track('checkin_saved') }),
    schedule: (store) => wrap(store, { add: () => track('calendar_event_created') }),
    tasks: (store) => wrap(store, { add: () => track('task_created') }),
    routines: (store) => wrap(store, { setCompleted: (r, [, completed]) => { if (completed === true) track('routine_completed'); } }),
    familySharing: (store) => wrap(store, { set: () => track('family_settings_changed'), reset: () => track('family_settings_changed') }),
    helpRequests: (store) => wrap(store, { add: () => track('help_request_draft_created') }),
    posts: (store) => wrap(store, { add: () => track('community_post_saved') }),
    groups: (store) => wrap(store, { add: () => track('group_draft_created') }),
    meetups: (store) => wrap(store, { add: () => track('meetup_draft_created') }),
    /* screens that open a public item call these with the item; only its TYPE is read */
    careOpened: (item) => track('care_item_opened', { contentType: typeOf(item) }),
    enjoyOpened: (item) => track('enjoy_item_opened', { contentType: typeOf(item) }),
    productOpened: () => track('product_opened'),
  });
}
