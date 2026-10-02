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
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider } from './search.js';
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
import { createLifelongClassSource, createFacilitySource, createUnconnectedSource, createEnjoyPlaceSource, createTourPlaceSource } from './data-source.js';
import { createHomeView } from './home-view.js';
import { createTaskStore } from './tasks.js';
import { createRoutineStore } from './routines.js';
import { createSleepStore } from './sleep.js';
import { createExpenseStore } from './expenses.js';
import { createJournalStore } from './journal.js';
import { createSymptomStore } from './symptoms.js';
import { createHealthNoteStore } from './health-notes.js';
import { createFamilySharingStore, createHelpRequestStore } from './family.js';
import { createFamilyView } from './family-view.js';
import { createCareView, resolveCareSection } from './care-view.js';
import { createEnjoyView, resolveEnjoySection } from './enjoy-view.js';
import { createPostStore, createGroupStore, createMeetupStore } from './community.js';
import { createCommunityView, resolveCommunitySection } from './community-view.js';
import { reviewPrefill } from './community-contracts.js';
import { createLifeView, lifeHash, resolveSection } from './life-view.js';
import { focusNode } from './accessibility.js';
import { dateKey } from './dates.js';
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
const tasks = createTaskStore(storage);
const routines = createRoutineStore(storage);
const sleep = createSleepStore(storage);
const expenses = createExpenseStore(storage);
const journal = createJournalStore(storage);
const symptoms = createSymptomStore(storage);
const healthNotes = createHealthNoteStore(storage);
const familySharing = createFamilySharingStore(storage);
const helpRequests = createHelpRequestStore(storage);
const communityPosts = createPostStore(storage);
const meetupDrafts = createMeetupStore(storage);
const groupDrafts = createGroupStore(storage, { meetups: meetupDrafts });

/* set by a Home shortcut that continues in My Life; used once, when My Life is shown */
let pendingLifeAdd = null;
let lifeDay = dateKey();

const search = createSearch();
search.registerProvider(createAreaProvider(AREAS));
search.registerProvider(createSavedProvider(saved, SAVED_TYPE_LABELS));

applyPreferences(html, profile.getPreferences());

/* view shells for the areas that are still shells; Home, My Life, Family and Care have their own views */
for (const area of PRIMARY_AREAS) {
  if (area.id === 'home' || area.id === 'life' || area.id === 'family' || area.id === 'care' || area.id === 'enjoy' || area.id === 'community') continue;
  const host = doc.querySelector(`[data-og-modules="${area.id}"]`);
  if (host) renderArea(area, host);
}

/*
 * The one external source Home can ask (내 주변). The API location comes from the site's existing API config
 * (window.LivonApi, written at build time); without it the same-origin path is tried. Either way the source
 * checks the route's status first and reports "unavailable" quietly when there is nothing to use.
 */
const apiConfig = win.LivonApi && typeof win.LivonApi.url === 'function' ? win.LivonApi : null;
/* one data-API handle (the site's existing route) shared by the two sources that may ask it — fetch is injected once */
const dataApi = {
  apiUrl: (path) => (apiConfig ? apiConfig.url(path) : path),
  fetcher: typeof win.fetch === 'function' ? (url, init) => win.fetch(url, init) : null,
};
const nearbySource = createLifelongClassSource(dataApi);

/* 즐길거리 view, created further down; Home's 오늘 뭐 하지? reads it lazily */
let enjoyView = null;
/* a review started from 즐길거리, handed to 커뮤니티 once (memory only) */
let pendingReview = null;

const home = createHomeView({
  host: doc.querySelector('[data-og-modules="home"]'),
  doc,
  stores: { profile, checkIn, schedule, medication, dailyLife, tasks, routines, saved, familyConnection: onboarding.familyConnection },
  source: nearbySource,
  /* the 가족 card states only local facts: sharing choices made, help requests written (not sent) */
  family: { sharing: familySharing, help: helpRequests },
  /* 오늘 뭐 하지?: what the user found on 즐길거리 this visit (set once that screen exists, below) */
  enjoyLoaded: () => (enjoyView ? enjoyView.items() : []),
  /* Home has no task form of its own: "할 일 추가" opens the one in 내 생활 › 할 일 */
  onAddTask: () => {
    pendingLifeAdd = 'tasks';
    win.location.hash = lifeHash('tasks');
  },
});

const films = createFilms({
  doc,
  win,
  getMotion: () => profile.getPreferences().motion,
  setMotion: (motion) => profile.updatePreferences({ motion }),
});

/* My Life reads the same schedule and daily-life stores as Home: one set of records, two screens */
const life = createLifeView({
  host: doc.querySelector('[data-og-modules="life"]'),
  stores: { schedule, tasks, routines, dailyLife, sleep, expenses, journal },
  /* 건강 (Phase 3): check-in and medication are the very objects Home uses; all four stay on this device */
  health: { checkIn, symptoms, medication, healthNotes },
});

/* Phase 4 — 가족: the user's own sharing choices and help-request notes. No family is connected; nothing is sent. */
const familyView = createFamilyView({
  host: doc.querySelector('[data-og-modules="family"]'),
  sharing: familySharing,
  help: helpRequests,
  profile,
  familyConnection: onboarding.familyConnection,
});

/*
 * Phase 4 — 돌봄·서비스: facilities through the existing place search (asked only on the user's button);
 * care services and benefits have no source yet and say so. Loaded results live in memory for the visit only.
 */
const care = createCareView({
  host: doc.querySelector('[data-og-modules="care"]'),
  doc,
  saved,
  profile,
  sources: {
    facility: createFacilitySource(dataApi),
    services: createUnconnectedSource('services', '돌봄 서비스'),
    benefits: createUnconnectedSource('benefits', '복지 혜택'),
  },
  onFamily: () => true,
});
/* global search may find PUBLIC care items that were actually loaded on that screen — never a personal record */
search.registerProvider(createCareProvider(() => care.items()));

/*
 * Phase 5 — 즐길거리: 평생학습 강좌 (the same source object Home's 내 주변 uses), 관광 정보 and 장소, each asked only on
 * the user's button. Loaded results live in memory for the visit only.
 */
enjoyView = createEnjoyView({
  host: doc.querySelector('[data-og-modules="enjoy"]'),
  doc,
  saved,
  profile,
  schedule,
  sources: { lifelong: nearbySource, tour: createTourPlaceSource(dataApi), place: createEnjoyPlaceSource(dataApi) },
  /* review: opens the community form with a little filled in; nothing is saved until the user saves */
  onReview: (item) => {
    pendingReview = reviewPrefill(item);
    win.location.hash = '#community/write';
  },
});
/* global search may find PUBLIC 즐길거리 items actually loaded on that screen — never a personal record */
search.registerProvider(createEnjoyProvider(() => enjoyView.items()));

/*
 * Phase 6 — 커뮤니티: the user's own posts and group/meetup drafts, on this device only. No search provider is
 * registered for them (they are personal), nothing is published, sent or notified.
 */
const communityView = createCommunityView({
  host: doc.querySelector('[data-og-modules="community"]'),
  doc,
  posts: communityPosts,
  groups: groupDrafts,
  meetups: meetupDrafts,
  saved,
  schedule,
});
const showCommunity = (section) => {
  if (pendingReview) {
    communityView.startReview(pendingReview);
    pendingReview = null;
  } else communityView.show(section);
};

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
    life.refresh();
    familyView.refresh();
    care.render();
    enjoyView.render();
    communityView.render();
    panels.updateBadge();
  },
});

function showLife(section, options) {
  life.show(section, options);
  lifeDay = dateKey();
  if (pendingLifeAdd) {
    const target = pendingLifeAdd;
    pendingLifeAdd = null;
    life.openAdd(target);
  }
}

const router = createRouter({
  win,
  doc,
  onChange: ({ view, userInitiated, section, sectionOnly }) => {
    /* an address that names no section of My Life shows 요약 and is corrected, instead of a broken screen */
    if (view === 'life' && section && !resolveSection(section)) win.history.replaceState(null, '', '#life');
    if (view === 'care' && section && !resolveCareSection(section)) win.history.replaceState(null, '', '#care');
    if (view === 'enjoy' && section && !resolveEnjoySection(section)) win.history.replaceState(null, '', '#enjoy');
    if (view === 'community' && section && !resolveCommunitySection(section)) win.history.replaceState(null, '', '#community');
    if (sectionOnly) {
      if (view === 'life') showLife(section, { focus: userInitiated });
      if (view === 'care') care.show(section);
      if (view === 'enjoy') enjoyView.show(section);
      if (view === 'community') showCommunity(section);
      return;
    }
    navigation.setCurrent(view);
    panels.closeAll();
    films.show(view);
    doc.title = viewTitle(areaById(view));
    if (view === 'account') accountView.render();
    if (view === 'saved') savedView.render();
    if (view === 'family') familyView.refresh();
    if (view === 'care') care.show(section);
    if (view === 'enjoy' && section) enjoyView.show(section);
    if (view === 'community') showCommunity(section);
    if (view === 'home') refreshHome();
    if (view === 'life') showLife(section, { focus: userInitiated && !!section, entered: true });
    if (userInitiated && !(view === 'life' && section)) focusView(doc, view);
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
  if (router.current() === 'life' && lifeDay !== dateKey()) {
    lifeDay = dateKey();
    life.refresh();
  }
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
win.Ongil = Object.freeze({ version: 'community-v1', storage, profile, saved, onboarding, notifications, account, search, router, checkIn, schedule, medication, dailyLife, tasks, routines, sleep, expenses, journal, symptoms, healthNotes, familySharing, helpRequests, care, enjoy: enjoyView, communityPosts, groupDrafts, meetupDrafts });
