/*
 * 스토어 (Store + Products V1, Phase 7) — find everyday things, understand them, save them, show them to family.
 *
 *   어떤 물건을 찾으세요?  ten categories (aria-pressed + ✓, never colour alone). #store/<slug> opens one.
 *   상품                  loading / unavailable / empty / results. Results: category, brand and seller filters (brand
 *                         and seller only when the loaded data has more than one), search over name · summary ·
 *                         brand · category · features, 가나다순 only, 24 rows at a time + 더 보기.
 *   비교하기              2–3 products side by side (screen state only, never stored).
 *   자세히                one <dialog>: real image only, the source's words labelled as the source's, price text
 *                         with "판매처에서 확인", 저장 (existing Saved PRODUCT), 가족에게 보여주기 (preview only),
 *                         판매처에서 보기 (external https link, new window — not an ONGIL purchase).
 *
 * There is no product source connected in this repository, so production shows "아직 연결된 상품이 없어요."
 * No cart, checkout, payment, order, shipping, inventory, review, price alert or browsing history exists.
 */
import { el, clear, append } from './dom.js';
import { createCard, choiceButton, makeField } from './home-ui.js';
import { setRegionState } from './views.js';
import {
  PRODUCT_CATEGORIES,
  productCategoryById,
  productCategoryBySlug,
  categoryLabel,
  sanitizeProducts,
  filterProducts,
  availableProductFilters,
  sortProducts,
  PRODUCT_SORTS,
  productDetailRows,
  productSavedInput,
  productFamilyPreview,
  toggleCompare,
  compareRows,
  COMPARE_MAX,
  PRICE_NOTE,
  CLAIM_NOTE,
} from './store-contracts.js';

const put = (node, ...kids) => append(node, kids);

export const STORE_SECTIONS = Object.freeze(PRODUCT_CATEGORIES.map((c) => c.slug));
export const resolveStoreSection = (name) => {
  const c = typeof name === 'string' ? productCategoryBySlug(name) : null;
  return c ? c.id : '';
};
export const STORE_PAGE = 24;
const MESSAGES = {
  NOT_CONNECTED: '아직 연결된 상품이 없어요.',
  NOT_CONFIGURED: '아직 연결된 상품이 없어요.',
  NO_ANSWER: '지금은 상품 정보를 받아오지 못했어요. 잠시 뒤 다시 확인해 주세요.',
};

export function createStoreView({ host, doc, saved, source }) {
  const state = { status: 'loading', reason: '', items: [], category: '', brand: '', seller: '', query: '', shown: STORE_PAGE, compare: [] };
  let cards = null;
  let dialog = null;
  let opener = null;
  let ticket = 0;

  /* ───────── 어떤 물건을 찾으세요? ───────── */

  function renderCategories(focusId) {
    const card = cards.categories;
    clear(card.body);
    put(
      card.body,
      el(
        'div',
        { class: 'og-picks og-store-cats', role: 'group', 'aria-label': '상품 분류' },
        PRODUCT_CATEGORIES.map((c) => {
          const b = choiceButton({ label: c.label, pressed: state.category === c.id, onChoose: () => choose(state.category === c.id ? '' : c.id, true) });
          b.dataset.ogStoreCategory = c.id;
          return b;
        })
      )
    );
    const chosen = productCategoryById(state.category);
    put(
      card.body,
      chosen
        ? el('div', { class: 'og-care-about', 'data-og-store-about': chosen.id }, el('h4', { class: 'og-life-sub', text: chosen.label }), el('p', { text: `${chosen.description}.` }), el('p', { class: 'og-home-note', text: `예를 들면 ${chosen.examples.join(', ')} 같은 물건이에요.` }))
        : el('p', { class: 'og-home-note', text: '분류를 고르면 그 분류의 상품만 보여 드려요. 다시 누르면 모든 분류를 봐요.' })
    );
    if (focusId) {
      const t = card.body.querySelector(`[data-og-store-category="${focusId}"]`);
      if (t) t.focus();
    }
  }

  function choose(category, fromUser) {
    state.category = category;
    state.shown = STORE_PAGE;
    renderCategories(fromUser ? category || null : null);
    renderResults();
    if (fromUser && typeof window !== 'undefined' && window.history) {
      const c = productCategoryById(category);
      const hash = c ? `#store/${c.slug}` : '#store';
      if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
    }
  }

  /* ───────── 상품 ───────── */

  async function load() {
    const mine = ++ticket;
    state.status = 'loading';
    renderResults();
    let result;
    try {
      result = await source.load();
    } catch {
      result = { state: 'unavailable', reason: 'NO_ANSWER', items: [] };
    }
    if (mine !== ticket) return;
    const items = result && result.state === 'ready' ? sanitizeProducts(result.items) : [];
    state.items = items;
    state.status = items.length ? 'ready' : result && (result.state === 'ready' || result.state === 'empty') ? 'empty' : 'unavailable';
    state.reason = state.status === 'unavailable' ? (result && result.reason) || 'NO_ANSWER' : '';
    state.compare = state.compare.filter((id) => items.some((p) => p.id === id));
    renderResults();
    renderCompare();
  }

  function visible() {
    return sortProducts(filterProducts(state.items, { category: state.category, brand: state.brand, seller: state.seller, query: state.query }));
  }

  function renderResults(focusSelector) {
    const card = cards.results;
    clear(card.body);
    card.root.dataset.ogState = state.status;
    const zone = el('div', { class: 'og-region og-home-region', 'data-og-region': 'store-results', role: 'region', 'aria-label': '상품 목록' });
    put(card.body, zone);
    if (state.status === 'loading') {
      setRegionState(zone, 'loading', '상품 정보를 불러오고 있어요…');
      zone.dataset.ogStoreState = 'loading';
      return;
    }
    if (state.status === 'unavailable') {
      zone.dataset.ogStoreState = 'unavailable';
      setRegionState(zone, 'empty', MESSAGES[state.reason] || MESSAGES.NOT_CONNECTED);
      put(
        zone,
        el('p', { class: 'og-home-note', 'data-og-store-empty': 'unavailable', text: '상품 정보가 연결되면 이곳에서 분류별로 찾고, 저장하고, 가족에게 보여줄 수 있어요. ONGIL은 상품을 지어내지 않아요.' }),
        state.reason === 'NO_ANSWER' ? el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-store-retry': 'true', text: '다시 확인', onclick: () => load() })) : null
      );
      return;
    }
    if (state.status === 'empty') {
      zone.dataset.ogStoreState = 'empty';
      setRegionState(zone, 'empty', '연결된 자료에 지금 보여 드릴 상품이 없어요.');
      put(zone, el('p', { class: 'og-home-note', 'data-og-store-empty': 'empty', text: '자료가 바뀌면 다시 보여 드릴게요.' }));
      return;
    }
    zone.dataset.ogStoreState = 'ready';
    setRegionState(zone, 'ready');
    const avail = availableProductFilters(state.items);
    if (state.brand && !avail.brands.includes(state.brand)) state.brand = '';
    if (state.seller && !avail.sellers.includes(state.seller)) state.seller = '';
    const rerender = (sel) => { state.shown = STORE_PAGE; renderResults(sel); };
    const controls = [];
    if (avail.brands.length) {
      const brand = makeField({ name: 'brand', label: '브랜드로 좁히기', type: 'select', required: false, options: avail.brands.map((b) => ({ id: b, label: b })), emptyLabel: '모든 브랜드' }, state.brand);
      brand.input.dataset.ogStoreFilter = 'brand';
      brand.input.addEventListener('change', () => { state.brand = brand.get(); rerender('[data-og-store-filter="brand"]'); });
      controls.push(brand.node);
    }
    if (avail.sellers.length) {
      const seller = makeField({ name: 'seller', label: '판매처로 좁히기', type: 'select', required: false, options: avail.sellers.map((b) => ({ id: b, label: b })), emptyLabel: '모든 판매처' }, state.seller);
      seller.input.dataset.ogStoreFilter = 'seller';
      seller.input.addEventListener('change', () => { state.seller = seller.get(); rerender('[data-og-store-filter="seller"]'); });
      controls.push(seller.node);
    }
    const search = makeField({ name: 'q', label: '상품 찾기', type: 'search', required: false, maxlength: 60, hint: '이름, 소개, 브랜드, 분류, 특징으로 찾아요.' }, state.query);
    search.input.dataset.ogStoreSearch = 'q';
    search.input.addEventListener('input', () => {
      state.query = search.get();
      state.shown = STORE_PAGE;
      const list = visible();
      zone.querySelector('[data-og-store-list]').replaceWith(resultList(list));
      const count = zone.querySelector('[data-og-store-count]');
      count.textContent = countText(list.length);
      count.dataset.ogStoreCount = String(list.length);
    });
    const list = visible();
    put(
      zone,
      search.node,
      ...controls,
      el('p', { class: 'og-home-note', 'data-og-store-sort': PRODUCT_SORTS[0].id, text: `${PRODUCT_SORTS[0].label}으로 보여 드려요. 순서는 이름으로만 정해요.` }),
      el('p', { class: 'og-life-value', 'data-og-store-count': String(list.length), 'aria-live': 'polite', text: countText(list.length) }),
      resultList(list)
    );
    if (focusSelector) {
      const target = zone.querySelector(focusSelector);
      if (target && !target.disabled) target.focus();
    }
  }
  const countText = (n) => `${state.category ? `${categoryLabel(state.category)} · ` : ''}${n}개`;

  /* at most `shown` rows exist in the DOM; 더 보기 adds the next page */
  function resultList(items) {
    const wrap = el('div', { 'data-og-store-list': items.length ? 'list' : 'empty' });
    if (!items.length) {
      wrap.append(el('p', { class: 'og-home-empty', text: '조건에 맞는 상품이 없어요.' }));
      return wrap;
    }
    const page = items.slice(0, state.shown);
    wrap.append(el('ul', { class: 'og-home-items', 'aria-label': '상품' }, page.map(row)));
    if (items.length > page.length) {
      wrap.append(
        el('div', { class: 'og-form__actions' }, el('button', {
          type: 'button',
          class: 'og-btn og-btn--ghost',
          'data-og-store-more': 'true',
          text: `더 보기 (${items.length - page.length}개 남음)`,
          onclick: () => {
            const first = state.shown;
            state.shown += STORE_PAGE;
            const next = resultList(items);
            wrap.replaceWith(next);
            const focusRow = next.querySelectorAll('[data-og-store-open]')[first];
            if (focusRow) focusRow.focus();
          },
        }))
      );
    }
    return wrap;
  }

  function compareButton(p, after) {
    const on = state.compare.includes(p.id);
    return el('button', {
      type: 'button',
      class: 'og-btn og-btn--ghost og-btn--small',
      'data-og-store-compare': p.id,
      'aria-pressed': on ? 'true' : 'false',
      'aria-label': on ? `‘${p.name}’ 비교에서 빼기` : `‘${p.name}’ 비교에 담기`,
      text: on ? '✓ 비교에 담음' : '비교에 담기',
      onclick: (event) => {
        const r = toggleCompare(state.compare, p.id);
        if (!r.ok) {
          cards.compare.say(`비교는 ${COMPARE_MAX}개까지 할 수 있어요. 하나를 빼고 다시 담아 주세요.`);
          return;
        }
        state.compare = r.selected;
        cards.compare.say(r.added ? `‘${p.name}’을(를) 비교에 담았어요. (${state.compare.length}/${COMPARE_MAX})` : `‘${p.name}’을(를) 비교에서 뺐어요.`);
        const b = event.currentTarget;
        const now = state.compare.includes(p.id);
        b.setAttribute('aria-pressed', now ? 'true' : 'false');
        b.setAttribute('aria-label', now ? `‘${p.name}’ 비교에서 빼기` : `‘${p.name}’ 비교에 담기`);
        b.textContent = now ? '✓ 비교에 담음' : '비교에 담기';
        for (const other of host.querySelectorAll(`[data-og-store-compare="${p.id}"]`)) if (other !== b) other.replaceWith(compareButton(p));
        renderCompare();
        if (typeof after === 'function') after();
      },
    });
  }

  function row(p) {
    const isSaved = saved.isSaved('PRODUCT', p.id);
    return el(
      'li',
      { class: 'og-home-item og-store-item', 'data-og-store-item': p.id },
      el(
        'div',
        { class: 'og-home-item__main og-home-item__main--plain' },
        el('p', { class: 'og-home-item__title og-store-name', text: p.name }),
        el('p', { class: 'og-home-item__meta og-store-text', text: [categoryLabel(p.category), p.brand, p.priceText ? `판매처 가격 ${p.priceText}` : '', p.sellerName, isSaved ? '저장함' : ''].filter(Boolean).join(' · ') }),
        el('p', { class: 'og-home-item__text og-store-text', text: p.summary })
      ),
      el('div', { class: 'og-home-item__actions og-store-actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-store-open': p.id, 'aria-haspopup': 'dialog', 'aria-label': `‘${p.name}’ 자세히 보기`, text: '자세히', onclick: (event) => openDetail(p, event.currentTarget) }), compareButton(p))
    );
  }

  /* ───────── 비교하기 ───────── */

  function renderCompare() {
    const card = cards.compare;
    clear(card.body);
    const chosen = state.compare.map((id) => state.items.find((p) => p.id === id)).filter(Boolean);
    card.root.dataset.ogCompare = String(chosen.length);
    if (!state.items.length) {
      put(card.body, el('p', { class: 'og-home-empty', 'data-og-store-empty': 'compare', text: '상품이 연결되면 2~3개를 골라 나란히 볼 수 있어요.' }));
      return;
    }
    if (chosen.length < 2) {
      put(card.body, el('p', { class: 'og-home-note', 'data-og-store-compare-hint': String(chosen.length), text: chosen.length ? `‘${chosen[0].name}’을(를) 담았어요. 하나 이상 더 담으면 나란히 보여 드려요.` : `목록에서 ‘비교에 담기’로 2~${COMPARE_MAX}개를 골라 주세요.` }));
    } else {
      put(
        card.body,
        el(
          'div',
          { class: 'og-store-compare', 'data-og-store-compare-view': String(chosen.length), role: 'group', 'aria-label': `상품 ${chosen.length}개 비교` },
          /* names already head every value, so the 이름 row is not repeated on screen */
          compareRows(chosen).filter((r) => r.key !== 'name').map((r) =>
            el('section', { class: 'og-store-compare__row', 'data-og-compare-field': r.key, 'aria-label': r.label }, el('h4', { class: 'og-life-sub', text: r.label }), el('dl', { class: 'og-store-compare__values' }, r.values.flatMap((v) => [el('dt', { class: 'og-store-text', text: v.name }), el('dd', { class: v.missing ? 'og-store-text og-store-missing' : 'og-store-text', 'data-og-compare-missing': v.missing ? 'true' : null, text: v.value })])))
          )
        ),
        el('p', { class: 'og-home-note', text: CLAIM_NOTE })
      );
    }
    if (chosen.length) {
      put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-store-compare-clear': 'true', text: '비교 비우기', onclick: () => { state.compare = []; renderCompare(); renderResults(); cards.compare.say('비교를 비웠어요.'); } })));
    }
  }

  /* ───────── 자세히 ───────── */

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'og-dialog og-care-dialog og-store-dialog', id: 'og-store-detail', 'aria-labelledby': 'og-store-detail-title' });
    /* Tab stays inside; Escape closes natively; focus returns to the row that opened it */
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, #og-store-detail-title')].filter((n) => n.getClientRects().length);
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
      const key = opener && opener.dataset ? opener.dataset.ogStoreOpen : '';
      const back = opener && opener.isConnected ? opener : key ? host.querySelector(`[data-og-store-open="${key}"]`) : null;
      if (back) back.focus();
      opener = null;
    });
    doc.body.append(dialog);
    return dialog;
  }

  /* a real image only; if it fails to load it is removed and the text card stays (no stock image) */
  function image(p) {
    if (!p.imageUrl) return null;
    const img = el('img', { class: 'og-store-image', src: p.imageUrl, alt: `${p.name} 상품 사진`, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer', 'data-og-store-image': 'true' });
    img.addEventListener('error', () => {
      const fig = img.closest('figure');
      if (fig) fig.remove();
      else img.remove();
    });
    return el('figure', { class: 'og-store-figure' }, img);
  }

  function openDetail(p, from, mode = 'detail') {
    const d = ensureDialog();
    if (from) opener = from;
    clear(d);
    const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });
    const close = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-store-close': 'true', text: '닫기', onclick: () => d.close() });
    const back = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-store-back': 'true', text: '자세히로 돌아가기', onclick: () => openDetail(p, null) });
    const body = el('div', { class: 'og-dialog__body' });
    put(body, el('p', { class: 'og-dialog__progress', text: categoryLabel(p.category) }), el('h2', { class: 'og-dialog__title og-store-name', id: 'og-store-detail-title', tabindex: '-1', text: p.name }));
    if (mode === 'family') {
      const preview = productFamilyPreview(p);
      put(
        body,
        el('div', { class: 'og-notice', role: 'note', 'data-og-store-family': 'not-connected' }, el('p', {}, el('strong', { text: '가족 연결이 필요해요.' })), el('p', { text: '아직 연결된 가족이 없어서 보내지 않았어요. 가족 연결 기능이 열리면 아래 내용만 보여줄 수 있어요.' })),
        el('dl', { class: 'og-care-rows og-store-rows', 'aria-label': '가족에게 보여질 수 있는 내용', 'data-og-store-family-preview': String(preview.fields.length) }, preview.fields.flatMap((f) => [el('dt', { text: f.label }), el('dd', { class: 'og-store-text', text: f.value })])),
        el('p', { class: 'og-home-note', text: '주소, 결제 정보, 건강 기록은 함께 보내지 않아요. 선물 주문이나 결제는 할 수 없어요.' }),
        el('div', { class: 'og-dialog__actions' }, back, close)
      );
    } else {
      put(body, image(p));
      put(body, el('dl', { class: 'og-care-rows og-store-rows', 'aria-label': '자세한 정보' }, productDetailRows(p).flatMap((r) => [el('dt', { text: r.label }), el('dd', { class: 'og-store-text', text: r.value })])));
      if (p.features.length) put(body, el('h3', { class: 'og-life-sub', text: '자료에 적힌 특징' }), el('ul', { class: 'og-store-features', 'data-og-store-features': String(p.features.length) }, p.features.map((f) => el('li', { class: 'og-store-text', text: f }))));
      if (p.priceText) put(body, el('p', { class: 'og-home-note', 'data-og-store-cost-note': 'true', text: PRICE_NOTE }));
      put(body, el('p', { class: 'og-home-note', text: CLAIM_NOTE }));
      const links = [];
      if (p.sellerUrl) links.push(el('a', { class: 'og-btn og-btn--ghost', href: p.sellerUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-store-seller': 'true', 'aria-label': `판매처에서 보기 — ${p.sellerName || '판매처'} 페이지가 새 창으로 열려요`, text: '판매처에서 보기 (새 창)' }));
      if (p.sourceUrl && p.sourceUrl !== p.sellerUrl) links.push(el('a', { class: 'og-btn og-btn--ghost', href: p.sourceUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-store-source': 'true', text: '자료 출처 보기 (새 창)' }));
      if (links.length) put(body, el('div', { class: 'og-dialog__actions' }, links), el('p', { class: 'og-home-note', 'data-og-store-external': 'true', text: 'ONGIL에서 사거나 결제하는 것이 아니에요. 판매처 페이지로 이동해 직접 확인하세요.' }));
      const isSaved = saved.isSaved('PRODUCT', p.id);
      const saveBtn = el('button', {
        type: 'button',
        class: 'og-btn og-btn--primary',
        'data-og-store-save': 'true',
        'aria-pressed': isSaved ? 'true' : 'false',
        text: isSaved ? '✓ 저장됨 (누르면 취소)' : '저장',
        onclick: () => {
          const r = saved.toggle(productSavedInput(p));
          status.textContent = r.ok ? (r.saved ? `‘${p.name}’을(를) 저장했어요. ‘저장’ 화면에서 다시 볼 수 있어요.` : `‘${p.name}’ 저장을 취소했어요.`) : '저장하지 못했어요.';
          saveBtn.setAttribute('aria-pressed', r.saved ? 'true' : 'false');
          saveBtn.textContent = r.saved ? '✓ 저장됨 (누르면 취소)' : '저장';
          renderResults();
          renderSaved();
        },
      });
      put(
        body,
        el('div', { class: 'og-dialog__actions' }, saveBtn, compareButton(p), el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-store-family-open': 'true', text: '가족에게 보여주기', onclick: () => openDetail(p, null, 'family') }), close),
        el('p', { class: 'og-home-note', text: 'ONGIL은 상품을 직접 팔지 않아요. 결제, 주문, 배송을 하지 않아요.' })
      );
    }
    put(body, status);
    d.append(body);
    if (!d.open && typeof d.showModal === 'function') d.showModal();
    const title = d.querySelector('#og-store-detail-title');
    if (title) title.focus();
  }

  /* ───────── 저장한 상품 · build ───────── */

  function renderSaved() {
    const card = cards.saved;
    const n = saved.list({ type: 'PRODUCT' }).length;
    clear(card.body);
    put(card.body, el('p', { class: n ? 'og-life-value' : 'og-home-empty', 'data-og-store-saved': String(n), text: n ? `저장한 상품 ${n}개` : '아직 저장한 상품이 없어요.' }), el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: '#saved', text: '저장 화면에서 보기' })));
  }

  function build() {
    clear(host);
    cards = {
      categories: createCard({ area: 'store', slot: 'categories', title: '어떤 물건을 찾으세요?', level: 1, lead: '생활·안전부터 선물까지 열 가지로 나눠 두었어요.' }),
      results: createCard({ area: 'store', slot: 'results', title: '상품', level: 2 }),
      compare: createCard({ area: 'store', slot: 'compare', title: '비교하기', level: 2, lead: `2~${COMPARE_MAX}개를 골라 이름, 브랜드, 가격 정보, 특징, 판매처를 나란히 봐요.` }),
      family: createCard({ area: 'store', slot: 'family', title: '가족과 함께 보기', level: 3 }),
      saved: createCard({ area: 'store', slot: 'saved', title: '저장한 상품', level: 3 }),
    };
    put(cards.family.body, el('p', { text: '상품 자세히에서 ‘가족에게 보여주기’를 누르면 어떤 내용이 가족에게 보일지 미리 볼 수 있어요.' }), el('p', { class: 'og-home-note', text: '아직 가족 연결이 없어 실제로 보내지는 않아요. 선물 주문, 주소 공유, 결제도 없어요.' }));
    put(
      host,
      el(
        'div',
        { class: 'og-wrap og-store' },
        el('p', { class: 'og-label', lang: 'en', text: 'STORE' }),
        el('h2', { class: 'og-h', id: 'og-store-section-title', tabindex: '-1', text: '스토어' }),
        el('p', { class: 'og-lead', text: '일상에 필요한 물건을 한곳에서 살펴보세요. 무엇인지, 어디에 쓰는지, 누가 파는지 알기 쉽게 보여 드려요.' }),
        el('p', { class: 'og-notice', role: 'note', 'data-og-store-mode': 'discovery' }, el('strong', { text: '알려 드립니다. ' }), 'ONGIL은 상품을 직접 팔지 않아요. 결제, 주문, 배송을 하지 않고, 구매는 판매처에서 직접 확인해요. 내 건강 기록을 보고 상품을 고르지 않아요.'),
        el('div', { class: 'og-care-grid' }, cards.categories.root, cards.results.root, cards.compare.root, cards.family.root, cards.saved.root)
      )
    );
    renderCategories();
    renderResults();
    renderCompare();
    renderSaved();
    host.dataset.ogRendered = 'true';
    load();
  }

  /* #store/<slug> opens that category */
  function show(section) {
    const c = resolveStoreSection(section);
    if (c !== state.category) choose(c, false);
    renderSaved();
    for (const card of Object.values(cards)) card.status.textContent = '';
  }

  build();
  return Object.freeze({
    show,
    /* public product information actually loaded on this screen (for global search) */
    items: () => state.items.map((p) => ({ ...p, features: [...p.features] })),
    status: () => state.status,
    reload: load,
    render: () => { renderCategories(); renderResults(); renderCompare(); renderSaved(); },
  });
}
