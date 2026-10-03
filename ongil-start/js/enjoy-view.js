/*
 * 즐길거리 (Enjoy + Local Discovery V1, Phase 5) — find something to do, nearby, from real public information.
 *
 *   무엇을 해볼까요?   six categories (taxonomy). Sub-categories are search words, never shown as programmes.
 *   찾아보기          region (default: the region set in 내 정보) + what to look for. Each target is one existing
 *                     source: 평생학습 강좌 (kr-lifelong-class), 관광 정보 (kr-tourapi), 장소 (kr-kakao-place).
 *                     Asked only on the button. Each source keeps its own state, so one failing source never
 *                     removes what another one found.
 *   찾은 것           type / category / region filters (only choices present in what was loaded), text search,
 *                     factual sort (가나다순, 시작일순 when dates exist), shown 30 at a time.
 *   자세히            one <dialog>, rebuilt for the chosen item: what · where · when · cost · who · source.
 *                     저장 (existing Saved), 내 일정에 추가 (preview first; real start date only; no duplicate),
 *                     가족에게 보내기 (preview only — no family is connected, nothing is sent).
 *
 * ONGIL does not run these programmes, take applications, book, or charge. Loaded results live in memory for the
 * visit only; browsing is not recorded. No location permission is ever asked for.
 */
import { el, clear, append } from './dom.js';
import { createCard, choiceButton, makeField, nextId } from './home-ui.js';
import { setRegionState } from './views.js';
import { REGIONS } from './contracts.js';
import { formatDateKey, formatTime } from './dates.js';
import { ENJOY_CATEGORIES, ENJOY_TYPES, enjoyCategoryById, typeLabel, TOUR_TYPES, fromKakaoPlace, fromTourPlace, sanitizeEnjoyItems, filterEnjoy, availableEnjoyFilters, sortOptions, sortEnjoy, detailRows, savedInputFor, calendarDraft, isAlreadyInCalendar, familySendPreview, LINK_LABELS } from './enjoy-contracts.js';

/* append that skips null/false children (a plain Node.append would print "null") */
const put = (node, ...kids) => append(node, kids);

export const ENJOY_SECTIONS = Object.freeze(ENJOY_CATEGORIES.map((c) => c.id.toLowerCase()));
export const resolveEnjoySection = (name) => (typeof name === 'string' && ENJOY_SECTIONS.includes(name) ? name.toUpperCase() : '');
export const PAGE_SIZE = 30;

/*
 * What can be looked for, per category. Each target is one call to one existing source. The words are search terms
 * (what to look up), not claims about what any place offers.
 */
const T = (id, label, source, params, category) => Object.freeze({ id, label, source, params, category });
export const SEARCH_TARGETS = Object.freeze([
  T('lifelong', '평생학습 강좌', 'lifelong', {}, null),
  T('tour-12', '관광지 (한국관광공사)', 'tour', { contentType: '12' }, 'OUTING'),
  T('tour-14', '문화시설 (한국관광공사)', 'tour', { contentType: '14' }, 'CULTURE'),
  T('tour-28', '레포츠 장소 (한국관광공사)', 'tour', { contentType: '28' }, 'EXERCISE'),
  T('kakao-park', '공원 (지도 검색)', 'place', { word: '공원' }, 'OUTING'),
  T('kakao-museum', '박물관 (지도 검색)', 'place', { word: '박물관' }, 'CULTURE'),
  T('kakao-gallery', '미술관 (지도 검색)', 'place', { word: '미술관' }, 'CULTURE'),
  T('kakao-theater', '공연장 (지도 검색)', 'place', { word: '공연장' }, 'CULTURE'),
  T('kakao-cinema', '영화관 (지도 검색)', 'place', { word: '영화관' }, 'CULTURE'),
  T('kakao-pool', '수영장 (지도 검색)', 'place', { word: '수영장' }, 'EXERCISE'),
  T('kakao-gym', '체육관 (지도 검색)', 'place', { word: '체육관' }, 'EXERCISE'),
  T('kakao-library', '도서관 (지도 검색)', 'place', { word: '도서관' }, 'LEARNING'),
]);
export const TARGETS_BY_CATEGORY = Object.freeze({
  HOBBY: ['lifelong'],
  LEARNING: ['lifelong', 'kakao-library'],
  EXERCISE: ['lifelong', 'tour-28', 'kakao-pool', 'kakao-gym'],
  CULTURE: ['tour-14', 'kakao-museum', 'kakao-gallery', 'kakao-theater', 'kakao-cinema'],
  OUTING: ['tour-12', 'kakao-park'],
  TRAVEL: ['tour-12'],
});
const targetById = (id) => SEARCH_TARGETS.find((t) => t.id === id) || null;
const MESSAGES = {
  NOT_CONFIGURED: '이 자료는 아직 연결되지 않았어요.',
  NOT_CONNECTED: '이 자료는 아직 연결되지 않았어요.',
  NO_ANSWER: '지금은 자료를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.',
  REGION_REQUIRED: '지역을 골라 주세요.',
  REGION_NOT_SUPPORTED: '관광 정보는 아직 서울, 부산, 대구, 인천, 광주, 대전, 경기만 찾을 수 있어요.',
};

/* onReview (Phase 6): optional; the review button hands the item to whoever owns writing (nothing is written here) */
export function createEnjoyView({ host, doc, saved, profile, schedule, sources, onReview = null, onOpen = null, now = () => Date.now() }) {
  const state = { category: '', type: '', filterCategory: '', region: '', query: '', sort: 'title', shown: PAGE_SIZE, items: [], sourceStatus: {} };
  let ticket = 0;
  let cards = null;
  let dialog = null;
  let opener = null;

  /* ───────── 무엇을 해볼까요? ───────── */

  function renderCategories(focusId) {
    const card = cards.categories;
    clear(card.body);
    put(
      card.body,
      el(
        'div',
        { class: 'og-picks og-enjoy-cats', role: 'group', 'aria-label': '즐길거리 분류' },
        ENJOY_CATEGORIES.map((c) => {
          const b = choiceButton({ label: c.label, pressed: state.category === c.id, onChoose: () => choose(state.category === c.id ? '' : c.id, true) });
          b.dataset.ogEnjoyCategory = c.id;
          return b;
        })
      )
    );
    const chosen = enjoyCategoryById(state.category);
    put(
      card.body,
      chosen
        ? el('div', { class: 'og-care-about', 'data-og-enjoy-about': chosen.id }, el('h4', { class: 'og-life-sub', text: chosen.label }), el('p', { text: `${chosen.description}.` }), el('p', { class: 'og-home-note', text: `예를 들면 ${chosen.subs.join(', ')} 같은 것이에요. 아래에서 지역을 고르고 찾아보세요.` }))
        : el('p', { class: 'og-home-note', text: '분류를 고르면 그 분류에서 찾을 수 있는 자료만 보여 드려요.' })
    );
    if (focusId) {
      const t = card.body.querySelector(`[data-og-enjoy-category="${focusId}"]`);
      if (t) t.focus();
    }
  }

  function choose(category, fromUser) {
    state.category = category;
    state.filterCategory = category;
    renderCategories(fromUser ? category || null : null);
    renderSearch();
    renderResults();
    if (fromUser && typeof window !== 'undefined' && window.history) {
      const hash = category ? `#enjoy/${category.toLowerCase()}` : '#enjoy';
      if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
    }
  }

  /* ───────── 찾아보기 ───────── */

  function targetsNow() {
    const ids = state.category ? TARGETS_BY_CATEGORY[state.category] : SEARCH_TARGETS.map((t) => t.id);
    return ids.map(targetById).filter(Boolean);
  }

  function renderSearch() {
    const card = cards.search;
    clear(card.body);
    const myRegion = profile.getProfile().region;
    const region = makeField({ name: 'region', label: '지역', type: 'select', required: true, options: REGIONS, hint: myRegion ? `기본값은 내 정보에 설정한 지역(${myRegion})이에요.` : '내 정보에 지역을 정해 두면 기본으로 골라 둘게요.' }, state.region || myRegion);
    if (!state.region && !myRegion) region.input.prepend(el('option', { value: '', text: '지역 고르기', selected: true }));
    const targets = targetsNow();
    const what = makeField({ name: 'target', label: '무엇을 찾을까요?', type: 'select', required: true, options: targets.map((t) => ({ id: t.id, label: t.label })) }, targets[0] ? targets[0].id : '');
    const word = makeField({ name: 'word', label: '강좌 이름에 들어갈 말', type: 'text', required: false, maxlength: 30, hint: state.category ? `예: ${enjoyCategoryById(state.category).subs.slice(0, 3).join(', ')}` : '예: 스마트폰, 서예, 요가' });
    const syncWord = () => { word.node.hidden = (targetById(what.get()) || {}).source !== 'lifelong'; };
    what.input.addEventListener('change', syncWord);
    syncWord();
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const button = el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-enjoy-find': 'go', text: '찾기' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '즐길거리 찾아보기' }, region.node, what.node, word.node, error, el('div', { class: 'og-form__actions' }, button));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = region.get();
      const t = targetById(what.get());
      if (!REGIONS.some((x) => x.id === r)) {
        region.input.setAttribute('aria-invalid', 'true');
        error.textContent = MESSAGES.REGION_REQUIRED;
        region.input.focus();
        return;
      }
      region.input.removeAttribute('aria-invalid');
      error.textContent = '';
      state.region = r;
      await runSearch(t, r, word.get(), button);
    });
    put(
      card.body,
      el('p', { class: 'og-home-note', text: '지역 이름과 찾을 것만 보내며, ‘찾기’를 눌렀을 때만 찾습니다. 내 위치는 묻지 않아요. 찾은 결과는 이 화면을 보는 동안만 보여요.' }),
      form,
      statusList()
    );
  }

  /* each source keeps its own last state — one failing never hides what another found */
  function statusList() {
    const entries = Object.entries(state.sourceStatus);
    const zone = el('div', { class: 'og-region og-home-region', 'data-og-region': 'enjoy-sources', role: 'region', 'aria-label': '자료별 상태' });
    if (!entries.length) return zone;
    setRegionState(zone, 'ready');
    zone.append(
      el(
        'ul',
        { class: 'og-life-days', 'aria-label': '자료별 상태' },
        entries.map(([id, s]) => el('li', { 'data-og-enjoy-source': id, 'data-og-state': s.state }, el('span', { class: 'og-life-days__date', text: (targetById(id) || { label: id }).label }), el('span', { class: 'og-life-days__text', text: s.text })))
      )
    );
    return zone;
  }

  async function runSearch(target, region, word, button) {
    const mine = ++ticket;
    button.disabled = true;
    state.sourceStatus[target.id] = { state: 'loading', text: '찾고 있어요…' };
    const zone = cards.search.body.querySelector('[data-og-region="enjoy-sources"]');
    const fresh = statusList();
    setRegionState(fresh, 'loading', '찾고 있습니다.');
    zone.replaceWith(fresh);
    const category = target.category || state.category || (target.source === 'lifelong' ? 'LEARNING' : '');
    let result;
    try {
      if (target.source === 'lifelong') result = await sources.lifelong.load({ region, query: word, limit: 20, category: category || 'LEARNING' });
      else if (target.source === 'tour') result = await sources.tour.load({ region, contentType: target.params.contentType });
      else result = await sources.place.load({ region, word: target.params.word });
    } catch {
      result = { state: 'unavailable', reason: 'NO_ANSWER', items: [] };
    }
    if (mine !== ticket) return;
    button.disabled = false;
    let items = [];
    if (result.state === 'ready') {
      const inputs = target.source === 'lifelong' ? result.items : target.source === 'tour' ? result.items.map((raw) => fromTourPlace(raw, category)) : result.items.map((raw) => fromKakaoPlace(raw, category));
      items = sanitizeEnjoyItems(inputs.filter(Boolean));
    }
    /* replace only what this same target found before; everything else stays */
    const tag = (i) => `${target.id}`;
    state.items = [...state.items.filter((i) => i._target !== target.id), ...items.map((i) => ({ ...i, _target: tag(i) }))];
    state.shown = PAGE_SIZE;
    const text = result.state === 'ready' && items.length ? `${region}에서 ${items.length}건 찾았어요.` : result.state === 'empty' || result.state === 'ready' ? `${region}에서 찾지 못했어요.` : MESSAGES[result.reason] || MESSAGES.NOT_CONNECTED;
    state.sourceStatus[target.id] = { state: items.length ? 'ready' : result.state === 'unavailable' ? 'unavailable' : 'empty', text };
    cards.search.body.querySelector('[data-og-region="enjoy-sources"]').replaceWith(statusList());
    cards.search.say(text);
    renderResults();
  }

  /* ───────── 찾은 것 ───────── */

  function visible() {
    return sortEnjoy(filterEnjoy(state.items, { type: state.type, category: state.filterCategory, region: state.resultRegion || '', query: state.query }), state.sort);
  }

  function filterGroup(title, key, options, current, onPick, available) {
    const id = nextId('q');
    return el(
      'div',
      { class: 'og-health-q' },
      el('h4', { class: 'og-life-sub', id, text: title }),
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-labelledby': id },
        [{ id: '', label: '전체' }, ...options].map((o) => {
          const b = choiceButton({ label: o.label, pressed: current === o.id, onChoose: () => onPick(o.id) });
          b.dataset.ogEnjoyFilter = `${key}:${o.id || 'all'}`;
          if (o.id && !available.includes(o.id)) {
            b.disabled = true;
            b.setAttribute('aria-disabled', 'true');
          }
          return b;
        })
      )
    );
  }

  function renderResults(focusSelector) {
    const card = cards.results;
    clear(card.body);
    card.root.dataset.ogState = state.items.length ? 'filled' : 'empty';
    if (!state.items.length) {
      put(card.body, el('p', { class: 'og-home-empty', 'data-og-enjoy-empty': 'results', text: '아직 찾은 것이 없어요.' }), el('p', { class: 'og-home-note', text: '연결된 자료에서 찾은 것만 보여 드려요. 강좌나 장소를 지어내지 않아요.' }));
      return;
    }
    const avail = availableEnjoyFilters(state.items);
    if (state.type && !avail.types.includes(state.type)) state.type = '';
    if (state.filterCategory && !avail.categories.includes(state.filterCategory)) state.filterCategory = '';
    if (state.resultRegion && !avail.regions.includes(state.resultRegion)) state.resultRegion = '';
    const sorts = sortOptions(state.items);
    if (!sorts.some((s) => s.id === state.sort)) state.sort = 'title';
    const rerender = (sel) => { state.shown = PAGE_SIZE; renderResults(sel); };
    put(
      card.body,
      filterGroup('종류', 'type', ENJOY_TYPES, state.type, (id) => { state.type = id; rerender(`[data-og-enjoy-filter="type:${id || 'all'}"]`); }, avail.types),
      filterGroup('분류', 'category', ENJOY_CATEGORIES, state.filterCategory, (id) => { state.filterCategory = id; rerender(`[data-og-enjoy-filter="category:${id || 'all'}"]`); }, avail.categories)
    );
    /* a region choice only when the results really span more than one region */
    if (avail.regions.length > 1) {
      const region = makeField({ name: 'resultRegion', label: '지역으로 좁히기', type: 'select', required: false, options: avail.regions.map((r) => ({ id: r, label: r })), emptyLabel: '모든 지역' }, state.resultRegion || '');
      region.input.dataset.ogEnjoyRegion = 'filter';
      region.input.addEventListener('change', () => { state.resultRegion = region.get(); rerender('[data-og-enjoy-region="filter"]'); });
      put(card.body, region.node);
    }
    const sort = makeField({ name: 'sort', label: '정렬', type: 'select', required: true, options: sorts }, state.sort);
    sort.input.dataset.ogEnjoySort = 'sort';
    sort.input.addEventListener('change', () => { state.sort = sort.get(); rerender('[data-og-enjoy-sort="sort"]'); });
    const search = makeField({ name: 'q', label: '찾은 것 안에서 찾기', type: 'search', required: false, maxlength: 60, hint: '이름, 기관, 장소, 소개로 찾아요.' }, state.query);
    search.input.dataset.ogEnjoySearch = 'q';
    search.input.addEventListener('input', () => {
      state.query = search.get();
      state.shown = PAGE_SIZE;
      const list = visible();
      card.body.querySelector('[data-og-enjoy-list]').replaceWith(resultList(list));
      const count = card.body.querySelector('[data-og-enjoy-count]');
      count.textContent = `${list.length}건`;
      count.dataset.ogEnjoyCount = String(list.length);
    });
    const list = visible();
    put(card.body, sort.node, search.node, el('p', { class: 'og-life-value', 'data-og-enjoy-count': String(list.length), 'aria-live': 'polite', text: `${list.length}건` }), resultList(list));
    if (focusSelector) {
      const target = card.body.querySelector(focusSelector);
      if (target && !target.disabled) target.focus();
    }
  }

  /* at most `shown` rows exist in the DOM; "더 보기" adds the next 30 */
  function resultList(items) {
    const wrap = el('div', { 'data-og-enjoy-list': items.length ? 'list' : 'empty' });
    if (!items.length) {
      wrap.append(el('p', { class: 'og-home-empty', text: '조건에 맞는 것이 없어요.' }));
      return wrap;
    }
    const page = items.slice(0, state.shown);
    wrap.append(el('ul', { class: 'og-home-items', 'aria-label': '찾은 즐길거리' }, page.map(row)));
    if (items.length > page.length) {
      wrap.append(
        el('div', { class: 'og-form__actions' }, el('button', {
          type: 'button',
          class: 'og-btn og-btn--ghost',
          'data-og-enjoy-more': 'true',
          text: `더 보기 (${items.length - page.length}건 남음)`,
          onclick: () => {
            const first = state.shown;
            state.shown += PAGE_SIZE;
            const next = resultList(items);
            wrap.replaceWith(next);
            const focusRow = next.querySelectorAll('[data-og-enjoy-open]')[first];
            if (focusRow) focusRow.focus();
          },
        }))
      );
    }
    return wrap;
  }

  function row(item) {
    const isSaved = saved.isSaved(savedInputFor(item).type, item.id);
    const where = item.type === 'PLACE' ? item.address : [item.organization, item.location].filter(Boolean).join(' · ');
    return el(
      'li',
      { class: 'og-home-item', 'data-og-enjoy-item': `${item.type}:${item.id}` },
      el(
        'div',
        { class: 'og-home-item__main og-home-item__main--plain' },
        el('p', { class: 'og-home-item__title', text: item.title }),
        el('p', { class: 'og-home-item__meta', text: [typeLabel(item.type), (enjoyCategoryById(item.category) || { label: '' }).label, item.region, item.startDate ? `시작 ${formatDateKey(item.startDate)}` : '', isSaved ? '저장함' : ''].filter(Boolean).join(' · ') }),
        where ? el('p', { class: 'og-home-item__text', text: where }) : null
      ),
      el('div', { class: 'og-home-item__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-enjoy-open': item.id, 'aria-haspopup': 'dialog', 'aria-label': `‘${item.title}’ 자세히 보기`, text: '자세히', onclick: (event) => openDetail(item, event.currentTarget) }))
    );
  }

  /* ───────── 자세히 ───────── */

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'og-dialog og-care-dialog og-enjoy-dialog', id: 'og-enjoy-detail', 'aria-labelledby': 'og-enjoy-detail-title' });
    /* keep Tab and Shift+Tab inside the open dialog (Escape closes it natively; focus returns on close) */
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, #og-enjoy-detail-title')].filter((n) => n.getClientRects().length);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      clear(dialog);
      const key = opener && opener.dataset ? opener.dataset.ogEnjoyOpen : '';
      const back = opener && opener.isConnected ? opener : key ? host.querySelector(`[data-og-enjoy-open="${key}"]`) : null;
      if (back) back.focus();
      opener = null;
    });
    doc.body.append(dialog);
    return dialog;
  }

  function openDetail(item, from, mode = 'detail') {
    /* [P9] a detail opened from a row (not a re-render inside the dialog): the owner is told, with the item only */
    if (from && mode === 'detail' && typeof onOpen === 'function') onOpen(item);
    const d = ensureDialog();
    if (from) opener = from;
    clear(d);
    const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });
    const close = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-enjoy-close': 'true', text: '닫기', onclick: () => d.close() });
    const back = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-enjoy-back': 'true', text: '자세히로 돌아가기', onclick: () => openDetail(item, null) });
    const body = el('div', { class: 'og-dialog__body' });
    put(body, el('p', { class: 'og-dialog__progress', text: typeLabel(item.type) }), el('h2', { class: 'og-dialog__title', id: 'og-enjoy-detail-title', tabindex: '-1', text: item.title }));
    if (mode === 'family') {
      const preview = familySendPreview(item);
      put(
        body,
        el('div', { class: 'og-notice', role: 'note', 'data-og-enjoy-family': 'not-connected' }, el('p', {}, el('strong', { text: '가족 연결이 필요해요.' })), el('p', { text: '아직 연결된 가족이 없어서 보내지 않았어요. 가족 연결 기능이 열리면 아래 내용만 보낼 수 있어요.' })),
        el('dl', { class: 'og-care-rows', 'aria-label': '보내질 수 있는 내용' }, preview.fields.flatMap((f) => [el('dt', { text: f.label }), el('dd', { text: f.value })])),
        el('p', { class: 'og-home-note', text: '내 일정이나 건강 기록은 함께 보내지 않아요.' }),
        el('div', { class: 'og-dialog__actions' }, back, close)
      );
    } else if (mode === 'calendar') {
      const draft = calendarDraft(item);
      const already = isAlreadyInCalendar(draft, schedule.listForDate(draft.date));
      const add = el('button', {
        type: 'button',
        class: 'og-btn og-btn--primary',
        'data-og-enjoy-calendar-add': 'true',
        disabled: already,
        text: already ? '이미 내 일정에 있어요' : '내 일정에 추가',
        onclick: () => {
          if (isAlreadyInCalendar(draft, schedule.listForDate(draft.date))) {
            status.textContent = '이미 내 일정에 있어요. 다시 추가하지 않았어요.';
            return;
          }
          const r = schedule.add({ title: draft.title, date: draft.date, time: draft.time });
          status.textContent = r.ok ? '내 일정에 추가했어요. 내 생활 › 캘린더에서 볼 수 있어요.' : '추가하지 못했어요.';
          if (r.ok) {
            add.disabled = true;
            add.textContent = '내 일정에 추가했어요';
            back.focus();
          }
        },
      });
      put(
        body,
        el('p', { text: '아래 내용으로 내 일정에 추가할까요? 신청이나 예약이 되는 것은 아니에요.' }),
        el('dl', { class: 'og-care-rows', 'aria-label': '추가될 일정', 'data-og-enjoy-calendar': 'preview' }, el('dt', { text: '일정 이름' }), el('dd', { text: draft.title }), el('dt', { text: '날짜' }), el('dd', { text: `${formatDateKey(draft.date)} (시작일)` }), draft.time ? el('dt', { text: '시간' }) : null, draft.time ? el('dd', { text: formatTime(draft.time) }) : null),
        el('div', { class: 'og-dialog__actions' }, add, back, close)
      );
    } else {
      const rows = detailRows(item);
      put(body, el('dl', { class: 'og-care-rows', 'aria-label': '자세한 정보' }, rows.flatMap((r) => [el('dt', { text: r.label }), el('dd', { text: r.value })])));
      if (item.sourceUrl && LINK_LABELS[item.linkKind]) put(body, el('div', { class: 'og-dialog__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: item.sourceUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-enjoy-link': item.linkKind, text: LINK_LABELS[item.linkKind] })));
      const isSaved = saved.isSaved(savedInputFor(item).type, item.id);
      const saveBtn = el('button', {
        type: 'button',
        class: 'og-btn og-btn--primary',
        'data-og-enjoy-save': 'true',
        'aria-pressed': isSaved ? 'true' : 'false',
        text: isSaved ? '✓ 저장됨 (누르면 취소)' : '저장',
        onclick: () => {
          const r = saved.toggle(savedInputFor(item));
          status.textContent = r.ok ? (r.saved ? `‘${item.title}’을(를) 저장했습니다. ‘저장’ 화면에서 다시 볼 수 있어요.` : `‘${item.title}’ 저장을 취소했습니다.`) : '저장하지 못했습니다.';
          saveBtn.setAttribute('aria-pressed', r.saved ? 'true' : 'false');
          saveBtn.textContent = r.saved ? '✓ 저장됨 (누르면 취소)' : '저장';
          renderResults();
          renderSaved();
        },
      });
      put(
        body,
        el('div', { class: 'og-dialog__actions' }, saveBtn, calendarDraft(item) ? el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-enjoy-calendar-open': 'true', text: '내 일정에 추가', onclick: () => openDetail(item, null, 'calendar') }) : null, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-enjoy-family-open': 'true', text: '가족에게 보여주기', onclick: () => openDetail(item, null, 'family') }), typeof onReview === 'function' ? el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-enjoy-review': 'true', text: '후기 쓰기', onclick: () => { opener = null; d.close(); onReview({ type: item.type, id: item.id, title: item.title, category: item.category }); } }) : null, close),
        el('p', { class: 'og-home-note', text: 'ONGIL이 운영하는 프로그램이 아니에요. 신청, 예약, 결제는 운영 기관이나 공식 페이지에서 직접 확인하세요.' })
      );
    }
    put(body, status);
    d.append(body);
    if (!d.open && typeof d.showModal === 'function') d.showModal();
    const title = d.querySelector('#og-enjoy-detail-title');
    if (title) title.focus();
  }

  /* ───────── build ───────── */

  function build() {
    clear(host);
    cards = {
      categories: createCard({ area: 'enjoy', slot: 'categories', title: '무엇을 해볼까요?', level: 1, lead: '해 보고 싶은 것을 고르면 찾을 수 있는 자료를 알려 드려요.' }),
      search: createCard({ area: 'enjoy', slot: 'search', title: '지역에서 찾아보기', level: 2, lead: '평생학습 강좌, 관광 정보, 가까운 장소를 지역별로 찾아요.' }),
      results: createCard({ area: 'enjoy', slot: 'results', title: '찾은 즐길거리', level: 2 }),
      saved: createCard({ area: 'enjoy', slot: 'saved', title: '저장한 즐길거리', level: 3 }),
    };
    put(
      host,
      el(
        'div',
        { class: 'og-wrap og-enjoy' },
        el('p', { class: 'og-label', lang: 'en', text: 'ENJOY' }),
        el('h2', { class: 'og-h', id: 'og-enjoy-section-title', tabindex: '-1', text: '즐길거리' }),
        el('p', { class: 'og-lead', text: '오늘은 무엇을 해볼까요? 배우고, 움직이고, 둘러볼 거리를 지역에서 찾아보세요.' }),
        el('p', { class: 'og-notice', role: 'note' }, el('strong', { text: '알려 드립니다. ' }), 'ONGIL이 운영하는 프로그램이 아니에요. 공공기관과 지도 서비스가 공개한 정보를 찾아 보여 드려요. 신청, 예약, 결제는 각 기관에서 직접 해요.'),
        el('div', { class: 'og-care-grid' }, cards.categories.root, cards.search.root, cards.results.root, cards.saved.root)
      )
    );
    renderCategories();
    renderSearch();
    renderResults();
    renderSaved();
    host.dataset.ogRendered = 'true';
  }

  function renderSaved() {
    const card = cards.saved;
    const n = saved.list({ type: 'PROGRAM' }).length + saved.list({ type: 'PLACE' }).length;
    clear(card.body);
    put(card.body, el('p', { class: n ? 'og-life-value' : 'og-home-empty', 'data-og-enjoy-saved': String(n), text: n ? `저장한 강좌·프로그램·장소 ${n}개` : '아직 저장한 즐길거리가 없어요.' }), el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: '#saved', text: '저장 화면에서 보기' })));
  }

  /* #enjoy/<category> opens that category */
  function show(section) {
    const c = resolveEnjoySection(section);
    if (c !== state.category) choose(c, false);
    renderSaved();
    for (const card of Object.values(cards)) card.status.textContent = '';
  }

  build();
  return Object.freeze({ show, items: () => state.items.map(({ _target, ...rest }) => rest), category: () => state.category, render: () => { renderCategories(); renderSearch(); renderResults(); renderSaved(); } });
}
