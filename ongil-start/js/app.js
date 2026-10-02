/*
 * ONGIL app entry.
 *
 *   storage (local-first)  →  profile · saved · onboarding · notifications · account boundary
 *   search foundation      →  providers: areas, saved
 *   router (hash)          →  navigation state · films · view shells · focus and title
 *
 * Nothing here talks to a server. See docs/ongil/PHASE_1_FOUNDATION_V1.md.
 */
import { resolveBackend, createStorage } from './storage.js';
import { SAVED_TYPE_LABELS } from './contracts.js';
import { createProfileStore } from './profile.js';
import { createSavedStore } from './saved.js';
import { createOnboarding } from './onboarding.js';
import { createNotificationCenter } from './notifications.js';
import { createAccount } from './account.js';
import { createSearch, createAreaProvider, createSavedProvider } from './search.js';
import { AREAS, PRIMARY_AREAS, areaById } from './areas.js';
import { createRouter } from './router.js';
import { createNavigation } from './navigation.js';
import { createFilms } from './film.js';
import { renderArea } from './views.js';
import { createSavedView } from './saved-view.js';
import { createAccountView } from './account-view.js';
import { createOnboardingView, renderInvitation } from './onboarding-view.js';
import { createCheckInStore } from './checkin.js';
import { createScheduleStore } from './schedule.js';
import { createMedicationStore } from './medication.js';
import { createDailyLifeStore } from './daily-life.js';
import { createLifelongClassSource } from './data-source.js';
import { createHomeView } from './home-view.js';
import { focusNode } from './accessibility.js';
import { createPanels } from './panels.js';
import { applyPreferences, viewTitle, focusView, bindSkipLink, bindScrollCues } from './accessibility.js';

const doc = document;
const win = window;
const html = doc.documentElement;

const storage = createStorage({ backend: resolveBackend(win) });
const profile = createProfileStore(storage);
const saved = createSavedStore(storage);
const onboarding = createOnboarding({ storage, profile });
const notifications = createNotificationCenter({ storage, profile });
const account = createAccount({ storage });
const checkIn = createCheckInStore(storage);
const schedule = createScheduleStore(storage);
const medication = createMedicationStore(storage);
const dailyLife = createDailyLifeStore(storage);

const search = createSearch();
search.registerProvider(createAreaProvider(AREAS));
search.registerProvider(createSavedProvider(saved, SAVED_TYPE_LABELS));

applyPreferences(html, profile.getPreferences());

/* view shells for the seven areas that are still shells; Home has its own view */
for (const area of PRIMARY_AREAS) {
  if (area.id === 'home') continue;
  const host = doc.querySelector(`[data-og-modules="${area.id}"]`);
  if (host) renderArea(area, host);
}

/*
 * The one external source Home can ask (내 주변). The API location comes from the site's existing API config
 * (window.LivonApi, written at build time); without it the same-origin path is tried. Either way the source
 * checks the route's status first and reports "unavailable" quietly when there is nothing to use.
 */
const apiConfig = win.LivonApi && typeof win.LivonApi.url === 'function' ? win.LivonApi : null;
const nearbySource = createLifelongClassSource({
  apiUrl: (path) => (apiConfig ? apiConfig.url(path) : path),
  fetcher: typeof win.fetch === 'function' ? (url, init) => win.fetch(url, init) : null,
});

const home = createHomeView({
  host: doc.querySelector('[data-og-modules="home"]'),
  doc,
  stores: { profile, checkIn, schedule, medication, dailyLife, saved, familyConnection: onboarding.familyConnection },
  source: nearbySource,
});

const films = createFilms({
  doc,
  win,
  getMotion: () => profile.getPreferences().motion,
  setMotion: (motion) => profile.updatePreferences({ motion }),
});

const navigation = createNavigation({ doc });
const panels = createPanels({ root: doc.querySelector('[data-og-tools]'), search, notifications });

const openOnboarding = (from) => onboardingView.open(from);
const refreshInvitation = () => {
  const inviteHost = home.extraHost();
  if (inviteHost) renderInvitation({ host: inviteHost, onboarding, onOpen: openOnboarding });
};
const refreshHome = () => {
  home.refresh();
  refreshInvitation();
};

const savedView = createSavedView({ host: doc.querySelector('[data-og-saved]'), saved, storage });
const accountView = createAccountView({
  host: doc.querySelector('[data-og-account]'),
  profile,
  account,
  notifications,
  onboarding,
  storage,
  onPreferencesChange: (preferences) => {
    applyPreferences(html, preferences);
    films.apply();
  },
  onOpenOnboarding: openOnboarding,
  onErased: () => {
    applyPreferences(html, profile.getPreferences());
    films.apply();
    refreshHome();
    panels.updateBadge();
  },
});

const router = createRouter({
  win,
  doc,
  onChange: ({ view, userInitiated }) => {
    navigation.setCurrent(view);
    panels.closeAll();
    films.show(view);
    doc.title = viewTitle(areaById(view));
    if (view === 'account') accountView.render();
    if (view === 'saved') savedView.render();
    if (view === 'home') refreshHome();
    if (userInitiated) focusView(doc, view);
  },
});

const onboardingView = createOnboardingView({
  dialog: doc.getElementById('og-onboarding'),
  onboarding,
  onClose: ({ reason }) => {
    refreshHome();
    /* Home was rebuilt, so the button that opened the dialog may be gone: keep focus on the page */
    if (reason !== 'account' && router.current() === 'home' && (!doc.activeElement || doc.activeElement === doc.body)) focusNode(doc.getElementById('og-home-section-title'));
    if (router.current() === 'account') accountView.render();
    if (reason === 'account') router.go('account');
  },
});

/* hero "시작하기": a first-time visitor is offered the short setup; everyone else is taken down to today's cards */
doc.addEventListener('click', (event) => {
  const start = event.target.closest('[data-og-start]');
  if (!start) return;
  event.preventDefault();
  if (onboarding.state().status === 'new') {
    openOnboarding(start);
    return;
  }
  const title = doc.getElementById('og-home-section-title');
  if (!title) return;
  const reduce = win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  title.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  focusNode(title);
});

/* the calendar day can change while the page stays open (left overnight, or reopened from the background) */
const checkDay = () => {
  if (router.current() === 'home' && home.dayChanged() && !onboardingView.isOpen()) refreshHome();
  else home.greet();
};
doc.addEventListener('visibilitychange', () => {
  if (doc.visibilityState === 'visible') checkDay();
});
win.setInterval(checkDay, 60000);

bindSkipLink(doc);
bindScrollCues(doc, win);
refreshInvitation();
router.start();
html.dataset.ogReady = 'true';

/* one stable handle for later phases and for manual checks; no secrets, nothing privileged */
win.Ongil = Object.freeze({ version: 'home-v1', storage, profile, saved, onboarding, notifications, account, search, router, checkIn, schedule, medication, dailyLife });
