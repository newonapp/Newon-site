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
import { createSearch, createAreaProvider, createSavedProvider, createCareProvider, createEnjoyProvider, createStoreProvider } from './search.js';
import { AREAS, PRIMARY_AREAS, areaById } from './areas.js';
import { createRouter, hashFor, resolveView } from './router.js';
import { createNavigation } from './navigation.js';
import { createFilms } from './film.js';
import { renderArea } from './views.js';
import { createSavedView } from './saved-view.js';
import { createAnalytics, lengthBucket, sizeBucket, providerBucket } from './analytics.js';
import { createInstrumentation } from './instrument.js';
import { createSourceRegistry, observeSource } from './source-status.js';
import { createAdminView } from './admin-view.js';
import { resolveAdminSection, contentType } from './routes.js';
import { canonicalHash } from './routes.js';
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
import { createStoreView, resolveStoreSection } from './store-view.js';
import { createProductSource } from './store-source.js';
import { createLifeView, lifeHash, resolveSection } from './life-view.js';
import { focusNode } from './accessibility.js';
import { dateKey } from './dates.js';
import { createPanels } from './panels.js';
import { createAssistant } from './assistant-tools.js';
import { createAssistantView } from './assistant-view.js';
import { safeRoute } from './routes.js';
import { applyPreferences, viewTitle, focusView, bindSkipLink, bindScrollCues, resetTabStart } from './accessibility.js';

const doc = document;
const win = window;
const html = doc.documentElement;

const storage = createStorage({ backend: resolveBackend(win) });
/*
 * Storage blocked (private mode, site data off): the app still runs from memory, so every screen says once — not only
 * 내 정보 — that what is typed here is gone when the window closes. Screens' own "추가했습니다" messages stay truthful.
 */
if (!storage.persistent) {
  const main = doc.getElementById('og-main');
  if (main && !main.querySelector('[data-og-storage="memory"]')) {
    const note = doc.createElement('p');
    note.className = 'og-notice';
    note.setAttribute('role', 'note');
    note.dataset.ogStorage = 'memory';
    note.textContent = '이 브라우저에서는 저장이 막혀 있습니다. 창을 닫으면 입력한 내용이 사라집니다.';
    main.prepend(note);
    /* the note is fixed under the header; <main> keeps its height free and scrolled-to sections stop below it */
    const reserve = () => { main.style.paddingTop = `${note.offsetHeight}px`; html.style.scrollPaddingTop = `${note.offsetHeight}px`; };
    reserve();
    if (typeof win.ResizeObserver === 'function') new win.ResizeObserver(reserve).observe(note);
    else win.addEventListener('resize', reserve);
  }
}
const profile = createProfileStore(storage);
/*
 * Phase 9 — local, privacy-preserving usage counters and the one place that feeds them (instrument.js). The stores
 * below are wrapped once, here; no screen calls analytics itself. Nothing is sent anywhere and no id is created.
 */
const APP_VERSION = 'hardening-v1';
const analytics = createAnalytics({ storage });
const instrument = createInstrumentation((name, props) => analytics.track(name, props, html.dataset.ogView || ''));
/* what each public-data source did during this visit (state and counts only), for the local operations view */
const sourceStatus = createSourceRegistry();

const saved = instrument.saved(createSavedStore(storage));
const onboarding = createOnboarding({ storage, profile });
const notifications = createNotificationCenter({ storage, profile });
const account = createAccount({ storage });
const checkIn = instrument.checkIn(createCheckInStore(storage));
const schedule = instrument.schedule(createScheduleStore(storage));
const medication = createMedicationStore(storage);
const dailyLife = createDailyLifeStore(storage);
const tasks = instrument.tasks(createTaskStore(storage));
const routines = instrument.routines(createRoutineStore(storage));
const sleep = createSleepStore(storage);
const expenses = createExpenseStore(storage);
const journal = createJournalStore(storage);
const symptoms = createSymptomStore(storage);
const healthNotes = createHealthNoteStore(storage);
const familySharing = instrument.familySharing(createFamilySharingStore(storage));
const helpRequests = instrument.helpRequests(createHelpRequestStore(storage));
const communityPosts = instrument.posts(createPostStore(storage));
const meetupStore = createMeetupStore(storage);
const meetupDrafts = instrument.meetups(meetupStore);
const groupDrafts = instrument.groups(createGroupStore(storage, { meetups: meetupStore }));

/* set by a Home shortcut that continues in My Life; used once, when My Life is shown */
let pendingLifeAdd = null;
let lifeDay = dateKey();

const search = createSearch();
search.registerProvider(createAreaProvider(AREAS));
search.registerProvider(createSavedProvider(saved, SAVED_TYPE_LABELS));

applyPreferences(html, profile.getPreferences());

/* view shells for the areas that are still shells; Home, My Life, Family and Care have their own views */
for (const area of PRIMARY_AREAS) {
  if (area.id === 'home' || area.id === 'life' || area.id === 'family' || area.id === 'care' || area.id === 'enjoy' || area.id === 'community' || area.id === 'store') continue;
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
const nearbySource = observeSource(createLifelongClassSource(dataApi), { id: 'lifelong-class', label: '평생학습 강좌', provider: 'kr-lifelong-class', purpose: '지역의 평생학습 강좌 찾기', features: ['홈 › 내 주변', '즐길거리'] }, sourceStatus);

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
    facility: observeSource(createFacilitySource(dataApi), { id: 'care-facility', label: '기관·시설', provider: 'kr-kakao-place', purpose: '가까운 복지관·보건소 같은 기관 찾기', features: ['돌봄·서비스'] }, sourceStatus),
    services: observeSource(createUnconnectedSource('services', '돌봄 서비스'), { id: 'care-services', label: '돌봄 서비스', provider: '', purpose: '돌봄 서비스 정보 (자료 없음)', features: ['돌봄·서비스'] }, sourceStatus),
    benefits: observeSource(createUnconnectedSource('benefits', '복지 혜택'), { id: 'care-benefits', label: '복지 혜택', provider: '', purpose: '복지 혜택 정보 (자료 없음)', features: ['돌봄·서비스'] }, sourceStatus),
  },
  onFamily: () => true,
  onOpen: instrument.careOpened,
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
  sources: {
    lifelong: nearbySource,
    tour: observeSource(createTourPlaceSource(dataApi), { id: 'tour-place', label: '관광 정보', provider: 'kr-tourapi', purpose: '관광지·문화시설·레포츠 정보 찾기', features: ['즐길거리'] }, sourceStatus),
    place: observeSource(createEnjoyPlaceSource(dataApi), { id: 'enjoy-place', label: '장소', provider: 'kr-kakao-place', purpose: '공원·박물관 같은 장소 찾기', features: ['즐길거리'] }, sourceStatus),
  },
  onOpen: instrument.enjoyOpened,
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
/*
 * Phase 7 — 스토어: product discovery only. No product source is connected in this repository, so the screen says
 * "아직 연결된 상품이 없어요." No cart, checkout, payment, order or shipping; nothing reads health records.
 * Products actually loaded on the screen (public information) are searchable as 상품.
 */
const storeView = createStoreView({
  host: doc.querySelector('[data-og-modules="store"]'),
  doc,
  saved,
  source: observeSource(createProductSource(), { id: 'products', label: '상품 정보', provider: '', purpose: '상품 정보 (자료 없음)', features: ['스토어'] }, sourceStatus),
  onOpen: instrument.productOpened,
});
search.registerProvider(createStoreProvider(() => storeView.items()));

const showCommunity = (section) => {
  if (pendingReview) {
    communityView.startReview(pendingReview);
    pendingReview = null;
  } else communityView.show(section);
};

const navigation = createNavigation({ doc });
const panels = createPanels({
  root: doc.querySelector('[data-og-tools]'),
  search,
  notifications,
  /* a search is counted by the LENGTH BUCKET of the query and the size of the answer — the words are never kept */
  onSearch: (o) => instrument.track('search_submit', { queryLength: lengthBucket(o.queryLength), resultCount: sizeBucket(o.total), providerCount: providerBucket(o.providerCount), outcome: o.state }),
  onResultOpen: (r) => instrument.track('search_result_open', { contentType: r.providerId === 'areas' ? 'MENU' : contentType(r.contentType || r.type) }),
});

/*
 * Phase 10 — ONGIL 도우미: a header panel that matches a typed request to what ONGIL can already do. No language
 * model is connected. Its tools get exactly these handles — the calendar, tasks, routines, saved items, the public
 * search and the family-connection state — and nothing else: no storage, profile, health, journal or expense store.
 * A calendar entry or a task is saved only after the person presses 확인. Requests are never stored or sent.
 */
const assistant = createAssistant({ schedule, tasks, routines, saved, search, familyConnection: onboarding.familyConnection });
const assistantView = createAssistantView({
  root: doc.querySelector('[data-og-tools]'),
  assistant,
  /* a result can only name a screen inside ONGIL; the address is checked once more before it is used */
  onNavigate: (route) => {
    const safe = safeRoute(route);
    if (safe) win.location.hash = safe;
  },
  /* counted as kinds only: which sort of request, which tool, how it ended — never the words */
  onEvent: (name, detail = {}) => {
    if (name === 'open') instrument.track('ai_open');
    if (name === 'intent') instrument.track('ai_intent_matched', { intent: detail.intent, result: detail.status });
    if (name === 'confirmed') instrument.track('ai_action_confirmed', { tool: detail.tool, result: detail.status });
    if (name === 'cancelled') instrument.track('ai_action_cancelled', { tool: detail.tool });
  },
});

/*
 * Phase 9 — 운영 보기 (#admin): a local, read-only operations view. No menu entry, no sign-in, no server: it shows
 * this copy of ONGIL only and says so. It reads no health, family or journal record, and no title or text of any record.
 */
const adminView = createAdminView({
  host: doc.querySelector('[data-og-admin]'),
  version: APP_VERSION,
  hostname: win.location.hostname,
  storage,
  search,
  saved,
  sources: sourceStatus,
  analytics,
  loaded: () => ({ care: care.items().length, enjoy: enjoyView.items().length, store: storeView.items().length }),
});

const openOnboarding = (from) => onboardingView.open(from);
const refreshInvitation = () => {
  const inviteHost = home.extraHost();
  if (inviteHost) renderInvitation({ host: inviteHost, onboarding, onOpen: openOnboarding });
};
const refreshHome = () => {
  home.refresh();
  refreshInvitation();
};

/* 저장함: a saved post can be checked against the posts on this device, so a deleted post is said to be gone (never rebuilt) */
const savedView = createSavedView({ host: doc.querySelector('[data-og-saved]'), saved, storage, origins: { POST: (id) => !!communityPosts.get(id) } });
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
    storeView.render();
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
    if (view === 'store' && section && !resolveStoreSection(section)) win.history.replaceState(null, '', '#store');
    if (view === 'admin' && section && !resolveAdminSection(section)) win.history.replaceState(null, '', '#admin');
    /* Phase 8: every other malformed address — a section on a screen that has none (#health/x), extra parts (#store/a/b),
       odd characters — is corrected to the screen itself, so no address is left pointing at something that is not there */
    if (win.location.hash.includes('/')) {
      /* an address the validator refuses outright (odd characters) still belongs to this screen */
      const fixed = canonicalHash(win.location.hash) || hashFor(view);
      if (fixed && !fixed.includes('/') && fixed !== win.location.hash) win.history.replaceState(null, '', fixed);
    }
    if (sectionOnly) {
      if (view === 'life') showLife(section, { focus: userInitiated });
      if (view === 'care') care.show(section);
      if (view === 'enjoy') enjoyView.show(section);
      if (view === 'community') showCommunity(section);
      if (view === 'store') storeView.show(section);
      if (view === 'admin') adminView.show(section);
      return;
    }
    navigation.setCurrent(view);
    panels.closeAll();
    films.show(view);
    doc.title = view === 'admin' ? '운영 보기 | Ongil' : viewTitle(areaById(view));
    instrument.track('screen_view', { view, hasSection: section ? 'yes' : 'no' });
    if (view === 'admin') adminView.show(section);
    if (view === 'account') accountView.render();
    if (view === 'saved') savedView.render();
    if (view === 'family') familyView.refresh();
    if (view === 'care') care.show(section);
    if (view === 'enjoy' && section) enjoyView.show(section);
    /* Phase 8: 즐길거리 keeps the category (and what was found) from earlier in the visit; the address says so too */
    if (view === 'enjoy' && !section && enjoyView.category()) win.history.replaceState(null, '', `#enjoy/${enjoyView.category().toLowerCase()}`);
    if (view === 'community') showCommunity(section);
    if (view === 'store') storeView.show(section);
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
/* "#og-main" and other ids on this page are places, not screens: they are left alone */
function inPageTarget(hash) {
  const id = typeof hash === 'string' ? hash.slice(1) : '';
  return /^[A-Za-z][\w-]{0,60}$/.test(id) && !!doc.getElementById(id);
}
/* Phase 9: the router is silent when a malformed section replaces no section on the same screen
   (#admin → #admin/OVERVIEW), so the address is also corrected here. replaceState raises no hashchange: no loop. */
/* Phase 11: an address that names no screen (and no place on this page) keeps the screen that is showing — and now says so */
win.addEventListener('hashchange', () => {
  const hash = win.location.hash;
  if (hash && !resolveView(hash) && !inPageTarget(hash)) win.history.replaceState(null, '', hashFor(router.current()));
});
win.addEventListener('hashchange', () => {
  const hash = win.location.hash;
  const view = resolveView(hash);
  if (!view || !hash.includes('/')) return;
  const fixed = canonicalHash(hash) || hashFor(view);
  if (fixed && !fixed.includes('/') && fixed !== hash) win.history.replaceState(null, '', fixed);
});
instrument.track('app_open');
router.start();
if (win.location.hash && !resolveView(win.location.hash) && !inPageTarget(win.location.hash)) win.history.replaceState(null, '', hashFor(router.current()));
html.dataset.ogReady = 'true';
/* the first Tab should reach "본문으로 건너뛰기" (see accessibility.js); once now, once after the shared scripts have finished */
resetTabStart(doc);
win.addEventListener('load', () => win.setTimeout(() => resetTabStart(doc), 0));

/* one stable handle for later phases and for manual checks; no secrets, nothing privileged */
win.Ongil = Object.freeze({ version: APP_VERSION, assistant, assistantView, analytics, sources: sourceStatus, storage, profile, saved, onboarding, notifications, account, search, router, checkIn, schedule, medication, dailyLife, tasks, routines, sleep, expenses, journal, symptoms, healthNotes, familySharing, helpRequests, care, enjoy: enjoyView, communityPosts, groupDrafts, meetupDrafts, store: storeView });
