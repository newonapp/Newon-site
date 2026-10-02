/*
 * 돌봄·서비스 (Care V1, Phase 4) — find, understand, save, and (later) pass on care information.
 *
 *   분류          eleven categories, each with one plain sentence about what it means
 *   기관 찾기     the one connected source: nearby facilities through the existing place search (data-source.js).
 *                 Asked only when the user presses the button; region + kind of facility only.
 *   서비스·혜택   no source is connected yet — each category says so plainly. Nothing is invented.
 *   결과          what was actually loaded: type / region filters (only choices that mean something), text search
 *   자세히        one <dialog> at a time: fields that exist, the official link only when there is one, 저장,
 *                 and 가족에게 보내기 as a PREVIEW (no family is connected, nothing is sent)
 *
 * No booking, application or payment exists, and no button suggests one. Loaded results live in memory for this
 * visit only: browsing is not recorded. Only 저장 writes anything (the existing Saved store).
 */
import { el, clear, append } from './dom.js';

/* append that skips null/false children (a plain Node.append would print "null") */
const put = (node, ...kids) => append(node, kids);
import { createCard, choiceButton, makeField, nextId } from './home-ui.js';
import { setRegionState } from './views.js';
import { REGIONS } from './contracts.js';
import { CARE_CATEGORIES, CARE_TYPES, FACILITY_KINDS, careCategoryById, facilityKindById, sanitizeCareItems, filterCare, availableFilters, detailRows, savedInputFor, familySendPreview } from './care-contracts.js';

export const CARE_SECTIONS = Object.freeze(CARE_CATEGORIES.map((c) => c.id));
export const resolveCareSection = (name) => (typeof name === 'string' && CARE_SECTIONS.includes(name) ? name : '');
const typeLabel = (id) => (CARE_TYPES.find((t) => t.id === id) || { label: '' }).label;
const MESSAGES = {
  NOT_CONFIGURED: '기관 정보는 아직 연결되지 않았어요. 연결되면 이 자리에서 찾아볼 수 있어요.',
  NOT_CONNECTED: '기관 정보는 아직 연결되지 않았어요. 연결되면 이 자리에서 찾아볼 수 있어요.',
  NO_ANSWER: '지금은 기관 정보를 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.',
  REGION_REQUIRED: '지역을 골라 주세요.',
};

export function createCareView({ host, doc, saved, profile, sources, onFamily, onOpen = null }) {
  const state = { category: '', type: '', region: '', query: '', items: [], attribution: '', lastLoad: null };
  let ticket = 0;
  let cards = null;
  let dialog = null;
  let opener = null;

  /* ───────── 분류 ───────── */

  function renderCategories(focusId) {
    const card = cards.categories;
    clear(card.body);
    put(card.body, 
      el(
        'div',
        { class: 'og-picks og-care-cats', role: 'group', 'aria-label': '돌봄·서비스 분류' },
        CARE_CATEGORIES.map((c) => {
          const b = choiceButton({ label: c.label, pressed: state.category === c.id, onChoose: () => choose(state.category === c.id ? '' : c.id, true) });
          b.dataset.ogCareCategory = c.id;
          return b;
        })
      )
    );
    const chosen = careCategoryById(state.category);
    if (chosen) {
      put(card.body, 
        el('div', { class: 'og-care-about', 'data-og-care-about': chosen.id }, el('h4', { class: 'og-life-sub', text: chosen.label }), el('p', { text: `${chosen.description}.` })),
        chosen.id === 'facility'
          ? el('p', { class: 'og-home-note', text: '아래 ‘가까운 기관 찾기’에서 지역과 기관 종류를 골라 찾아보세요.' })
          : el(
              'div',
              { class: 'og-care-unconnected', 'data-og-care-unconnected': chosen.id },
              el('p', { text: `${chosen.label} 서비스·혜택 정보는 아직 연결되지 않았어요.` }),
              el('p', { class: 'og-home-note', text: '가까운 복지관이나 행정복지센터에 문의해 볼 수 있어요. 아래에서 가까운 기관을 찾을 수 있습니다.' }),
              chosen.id === 'welfare' ? el('p', { class: 'og-home-note', text: '대상 여부는 공식 안내에서 확인하세요. ONGIL은 대상인지 판단하지 않습니다.' }) : null
            )
      );
    } else {
      put(card.body, el('p', { class: 'og-home-note', text: '분류를 고르면 무엇을 뜻하는지와 지금 볼 수 있는 정보를 알려 드려요.' }));
    }
    if (focusId) {
      const target = card.body.querySelector(`[data-og-care-category="${focusId}"]`);
      if (target) target.focus();
    }
  }

  function choose(category, fromUser) {
    state.category = category;
    renderCategories(fromUser ? category || null : null);
    renderResults();
    if (fromUser && typeof window !== 'undefined' && window.history && window.location.hash !== (category ? `#care/${category}` : '#care')) {
      window.history.replaceState(null, '', category ? `#care/${category}` : '#care');
    }
  }

  /* ───────── 가까운 기관 찾기 ───────── */

  function renderSearch() {
    const card = cards.search;
    clear(card.body);
    const myRegion = profile.getProfile().region;
    const region = makeField({ name: 'region', label: '지역', type: 'select', required: true, options: REGIONS }, state.region || myRegion);
    if (!state.region && !myRegion) region.input.prepend(el('option', { value: '', text: '지역 고르기', selected: true }));
    const kind = makeField({ name: 'kind', label: '기관 종류', type: 'select', required: true, options: FACILITY_KINDS.map((k) => ({ id: k.id, label: k.label })) }, state.lastLoad ? state.lastLoad.kind : FACILITY_KINDS[0].id);
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const zone = el('div', { class: 'og-region og-home-region', 'data-og-region': 'care-facility', role: 'region', 'aria-labelledby': card.titleId });
    const button = el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-care-find': 'facility', text: '찾기' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '가까운 기관 찾기' }, region.node, kind.node, error, el('div', { class: 'og-form__actions' }, button));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = region.get();
      const k = facilityKindById(kind.get());
      if (!REGIONS.some((x) => x.id === r)) {
        region.input.setAttribute('aria-invalid', 'true');
        error.textContent = MESSAGES.REGION_REQUIRED;
        region.input.focus();
        return;
      }
      region.input.removeAttribute('aria-invalid');
      error.textContent = '';
      state.region = r;
      const mine = ++ticket;
      button.disabled = true;
      clear(zone);
      setRegionState(zone, 'loading', '기관을 찾고 있습니다.');
      let result;
      try {
        result = await sources.facility.load({ region: r, kind: k });
      } catch {
        result = { state: 'unavailable', reason: 'NO_ANSWER', items: [] };
      }
      if (mine !== ticket) return;
      button.disabled = false;
      state.lastLoad = { region: r, kind: k.id, state: result.state, reason: result.reason || '' };
      const items = result.state === 'ready' ? sanitizeCareItems(result.items) : [];
      /* a new search replaces the facilities found before; nothing is kept after the visit */
      state.items = [...state.items.filter((i) => i.type !== 'FACILITY'), ...items];
      state.attribution = items.length ? result.attribution || '' : state.attribution;
      showLoadState(zone, result.state, items.length, r, k);
      renderResults();
    });
    put(card.body, 
      el('p', { class: 'og-home-note', text: '지역 이름과 기관 종류만 보내며, ‘찾기’를 눌렀을 때만 찾습니다. 찾은 결과는 이 화면을 보는 동안만 보이고 따로 저장하지 않아요.' }),
      form,
      zone
    );
    if (state.lastLoad) showLoadState(zone, state.lastLoad.state, state.items.filter((i) => i.type === 'FACILITY').length, state.lastLoad.region, facilityKindById(state.lastLoad.kind));
  }

  function showLoadState(zone, status, count, region, kind) {
    clear(zone);
    cards.search.root.dataset.ogState = status;
    if (status === 'ready' && count) {
      setRegionState(zone, 'ready');
      zone.append(el('p', { class: 'og-life-value', 'data-og-care-found': String(count), text: `${region} ${kind.label} ${count}곳을 찾았어요. 아래 결과에서 볼 수 있어요.` }));
      cards.search.say(`${count}곳을 찾았습니다.`);
    } else if (status === 'empty' || (status === 'ready' && !count)) {
      setRegionState(zone, 'empty', `${region}에서 ${kind.label}을(를) 찾지 못했어요.`);
    } else {
      setRegionState(zone, 'empty', MESSAGES[(state.lastLoad && state.lastLoad.reason) || 'NOT_CONNECTED'] || MESSAGES.NOT_CONNECTED);
    }
  }

  /* ───────── 결과 ───────── */

  function renderResults(focusSelector) {
    const card = cards.results;
    clear(card.body);
    const avail = availableFilters(state.items);
    if (state.type && !avail.types.includes(state.type)) state.type = '';
    const shown = visible();
    card.root.dataset.ogState = state.items.length ? 'filled' : 'empty';
    if (!state.items.length) {
      put(card.body, el('p', { class: 'og-home-empty', 'data-og-care-empty': 'results', text: '아직 보여 드릴 결과가 없어요.' }), el('p', { class: 'og-home-note', text: '연결된 자료에서 찾은 것만 보여 드려요. 가짜 기관이나 서비스는 만들지 않아요.' }));
      return;
    }
    /* filters: only choices that match what is loaded; a type with nothing loaded is disabled, not given a count */
    const typeGroupId = nextId('q');
    put(card.body, 
      el('h4', { class: 'og-life-sub', id: typeGroupId, text: '종류' }),
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-labelledby': typeGroupId },
        [{ id: '', label: '전체' }, ...CARE_TYPES].map((t) => {
          const b = choiceButton({ label: t.label, pressed: state.type === t.id, onChoose: () => { state.type = t.id; renderResults(`[data-og-care-type="${t.id || 'all'}"]`); } });
          b.dataset.ogCareType = t.id || 'all';
          if (t.id && !avail.types.includes(t.id)) {
            b.disabled = true;
            b.setAttribute('aria-disabled', 'true');
          }
          return b;
        })
      )
    );
    const search = makeField({ name: 'q', label: '결과 안에서 찾기', type: 'search', required: false, maxlength: 60, hint: '이름, 주소, 설명으로 찾아요.' }, state.query);
    search.input.dataset.ogCareSearch = 'q';
    search.input.addEventListener('input', () => {
      state.query = search.get();
      const list = card.body.querySelector('[data-og-care-list]');
      const count = card.body.querySelector('[data-og-care-count]');
      const next = visible();
      list.replaceWith(resultList(next));
      count.textContent = `${next.length}건`;
      count.dataset.ogCareCount = String(next.length);
    });
    put(card.body, search.node, el('p', { class: 'og-life-value', 'data-og-care-count': String(shown.length), 'aria-live': 'polite', text: `${shown.length}건` }), resultList(shown));
    if (state.attribution) put(card.body, el('p', { class: 'og-home-note', text: state.attribution }));
    if (focusSelector) {
      const target = card.body.querySelector(focusSelector);
      if (target && !target.disabled) target.focus();
    }
  }

  /* a chosen category narrows services and benefits; facilities stay visible (they are where to ask) */
  function visible() {
    return filterCare(state.items, { type: state.type, query: state.query }).filter((i) => !state.category || i.category === state.category || i.type === 'FACILITY');
  }

  function resultList(items) {
    if (!items.length) return el('p', { class: 'og-home-empty', 'data-og-care-list': 'empty', text: '조건에 맞는 결과가 없어요.' });
    return el(
      'ul',
      { class: 'og-home-items', 'data-og-care-list': 'list', 'aria-label': '찾은 결과' },
      items.map((item) => {
        const isSaved = saved.isSaved(savedInputFor(item).type, item.id);
        return el(
          'li',
          { class: 'og-home-item', 'data-og-care-item': `${item.type}:${item.id}` },
          el(
            'div',
            { class: 'og-home-item__main og-home-item__main--plain' },
            el('p', { class: 'og-home-item__title', text: item.title }),
            el('p', { class: 'og-home-item__meta', text: [typeLabel(item.type), item.type === 'FACILITY' ? (facilityKindById(item.kind) || { label: '' }).label : '', isSaved ? '저장함' : ''].filter(Boolean).join(' · ') }),
            item.address || item.summary ? el('p', { class: 'og-home-item__text', text: item.address || item.summary }) : null
          ),
          el('div', { class: 'og-home-item__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-care-open': item.id, 'aria-haspopup': 'dialog', 'aria-label': `‘${item.title}’ 자세히 보기`, text: '자세히', onclick: (event) => openDetail(item, event.currentTarget) }))
        );
      })
    );
  }

  /* ───────── 자세히 (one dialog, rebuilt for the item it shows) ───────── */

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'og-dialog og-care-dialog', id: 'og-care-detail', 'aria-labelledby': 'og-care-detail-title' });
    /* keep Tab and Shift+Tab inside the open dialog (Escape closes it natively; focus returns on close) */
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex="-1"]#og-care-detail-title')].filter((n) => n.getClientRects().length);
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
      const back = opener && opener.isConnected ? opener : host.querySelector(`[data-og-care-open="${opener && opener.dataset ? opener.dataset.ogCareOpen : ''}"]`);
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
    opener = from || opener;
    clear(d);
    const isSaved = saved.isSaved(savedInputFor(item).type, item.id);
    const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });
    const close = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-care-close': 'true', text: '닫기', onclick: () => d.close() });
    const body = el('div', { class: 'og-dialog__body' });
    put(body, el('p', { class: 'og-dialog__progress', text: typeLabel(item.type) }), el('h2', { class: 'og-dialog__title', id: 'og-care-detail-title', tabindex: '-1', text: item.title }));
    if (mode === 'family') {
      const preview = familySendPreview(item);
      put(body, 
        el('div', { class: 'og-notice', role: 'note', 'data-og-care-family': 'not-connected' }, el('p', {}, el('strong', { text: '가족 연결이 필요해요.' })), el('p', { text: '아직 연결된 가족이 없어서 보내지 않았어요. 가족 연결 기능이 열리면 아래 내용만 보낼 수 있어요.' })),
        el('dl', { class: 'og-care-rows', 'aria-label': '보내질 수 있는 내용' }, preview.fields.flatMap((f) => [el('dt', { text: f.label }), el('dd', { text: f.value })])),
        el('p', { class: 'og-home-note', text: '내 건강 기록이나 메모는 함께 보내지 않아요.' }),
        el('div', { class: 'og-dialog__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-care-back': 'true', text: '자세히로 돌아가기', onclick: () => openDetail(item, null) }), onFamily ? el('a', { class: 'og-btn og-btn--ghost', href: '#family', text: '가족 화면 보기', onclick: () => d.close() }) : null, close)
      );
    } else {
      const rows = detailRows(item);
      put(body, el('dl', { class: 'og-care-rows', 'aria-label': '자세한 정보' }, rows.flatMap((r) => [el('dt', { text: r.label }), el('dd', { text: r.value })])));
      if (item.type === 'PUBLIC_BENEFIT') put(body, el('p', { class: 'og-home-note', text: '대상 여부는 공식 안내에서 확인하세요. ONGIL은 대상인지 판단하지 않습니다.' }));
      const links = [];
      if (item.sourceUrl) links.push(el('a', { class: 'og-btn og-btn--ghost', href: item.sourceUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-care-official': 'true', text: '공식 안내 보기 (새 창)' }));
      if (item.mapUrl) links.push(el('a', { class: 'og-btn og-btn--ghost', href: item.mapUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-care-map': 'true', text: '카카오맵에서 위치 보기 (새 창)' }));
      if (links.length) put(body, el('div', { class: 'og-dialog__actions' }, links));
      const saveBtn = el('button', {
        type: 'button',
        class: 'og-btn og-btn--primary',
        'data-og-care-save': 'true',
        'aria-pressed': isSaved ? 'true' : 'false',
        text: isSaved ? '✓ 저장됨 (누르면 취소)' : '저장',
        onclick: () => {
          const r = saved.toggle(savedInputFor(item));
          status.textContent = r.ok ? (r.saved ? `‘${item.title}’을(를) 저장했습니다. ‘저장’ 화면에서 다시 볼 수 있어요.` : `‘${item.title}’ 저장을 취소했습니다.`) : '저장하지 못했습니다.';
          saveBtn.setAttribute('aria-pressed', r.saved ? 'true' : 'false');
          saveBtn.textContent = r.saved ? '✓ 저장됨 (누르면 취소)' : '저장';
          renderResults();
        },
      });
      put(body, 
        el('div', { class: 'og-dialog__actions' }, saveBtn, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-care-family-open': 'true', text: '가족에게 보내기', onclick: () => openDetail(item, null, 'family') }), close),
        el('p', { class: 'og-home-note', text: '예약, 신청, 결제는 ONGIL에서 할 수 없어요. 이용하려면 기관이나 공식 안내로 직접 문의하세요.' })
      );
    }
    put(body, status);
    d.append(body);
    if (!d.open && typeof d.showModal === 'function') d.showModal();
    const title = d.querySelector('#og-care-detail-title');
    if (title) title.focus();
  }

  /* ───────── build ───────── */

  function build() {
    clear(host);
    cards = {
      categories: createCard({ area: 'care', slot: 'categories', title: '무엇이 필요하세요?', level: 1, lead: '분류를 고르면 뜻과 지금 볼 수 있는 정보를 알려 드려요.' }),
      search: createCard({ area: 'care', slot: 'facility-search', title: '가까운 기관 찾기', level: 2, lead: '복지관, 행정복지센터, 보건소 같은 곳을 지역별로 찾아요.' }),
      results: createCard({ area: 'care', slot: 'results', title: '찾은 결과', level: 2 }),
    };
    host.append(
      el(
        'div',
        { class: 'og-wrap og-care' },
        el('p', { class: 'og-label', lang: 'en', text: 'CARE' }),
        el('h2', { class: 'og-h', id: 'og-care-section-title', tabindex: '-1', text: '돌봄·서비스' }),
        el('p', { class: 'og-lead', text: '필요한 돌봄과 생활 지원, 가까운 기관을 찾아보고 저장하는 곳입니다.' }),
        el('p', { class: 'og-notice', role: 'note' }, el('strong', { text: '알려 드립니다. ' }), '예약, 신청, 결제 기능은 없습니다. 돌봄 서비스와 복지 혜택 정보는 아직 연결되지 않았고, 지금은 가까운 기관 찾기만 할 수 있어요(연결된 경우).'),
        el('div', { class: 'og-care-grid' }, cards.categories.root, cards.search.root, cards.results.root)
      )
    );
    renderCategories();
    renderSearch();
    renderResults();
    host.dataset.ogRendered = 'true';
  }

  /* #care/<category> opens that category (from a help request, for example). Nothing is applied for. */
  function show(section) {
    const c = resolveCareSection(section);
    if (c !== state.category) choose(c, false);
    for (const card of Object.values(cards)) card.status.textContent = '';
  }

  build();
  return Object.freeze({ show, items: () => state.items.slice(), category: () => state.category, openDetail, render: () => { renderCategories(); renderSearch(); renderResults(); } });
}
