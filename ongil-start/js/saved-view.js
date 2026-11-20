/*
 * 저장함 — everything the user saved, in one consistent list (Phase 1; unified in Phase 8).
 *
 * Reads and writes only through the saved store. What a row can do comes from the content registry (routes.js):
 *
 *   <owner> 화면에서 보기   opens the screen that owns this kind of item (a route inside ONGIL)
 *   출처 보기 (새 창)        an outside page, only when the item carries a safe https address and its type allows one
 *   저장 취소               removes the snapshot
 *
 * A row shows the snapshot taken when the item was saved; it is never rebuilt from a source. When the original can
 * be checked and is gone (a community post that was deleted) the row says so. Saved posts are marked "이 기기에만":
 * they are LOCAL_ONLY — never searched, never synced, never shared, and they have no outside link.
 *
 * Only the kinds that are actually saved get a filter, and at most SAVED_PAGE rows are in the DOM (+ 더 보기).
 */
import { el, clear, announce, formatDate } from './dom.js';
import { SAVED_TYPES, SAVED_TYPE_LABELS, savedSyncPolicy } from './contracts.js';
import { CONTENT_TYPES, ownerRoute } from './routes.js';

export const SAVED_PAGE = 30;
export const SNAPSHOT_NOTE = '저장할 때의 내용을 보여 드려요. 지금의 정보는 해당 화면이나 출처에서 확인하세요.';

/* what a row offers, as plain data (also used by tests) */
export function savedActions(item) {
  const def = CONTENT_TYPES[item.type];
  const external = def && def.external && /^https:\/\//.test(item.href || '') ? item.href : '';
  return {
    typeLabel: def ? def.label : '',
    localOnly: savedSyncPolicy(item) === 'LOCAL_ONLY',
    ownerRoute: ownerRoute(item.type, item.href),
    ownerLabel: def ? `${def.ownerLabel} 화면에서 보기` : '',
    externalUrl: external,
    externalLabel: item.type === 'PRODUCT' ? '판매처·출처 보기 (새 창)' : '출처 보기 (새 창)',
  };
}

/*
 * origins (optional): { <TYPE>: (id) => true | false } — whether the original still exists, for the kinds ONGIL can
 * check on this device. Public items are not checked: their sources are asked only on the owner screen.
 */
export function createSavedView({ host, saved, storage, origins = {} }) {
  let filter = '';
  let shown = SAVED_PAGE;
  const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });

  function filters(counts, total) {
    const button = (value, label, count) =>
      el('button', {
        type: 'button',
        class: 'og-filter',
        'data-og-saved-filter': value || 'ALL',
        'aria-pressed': filter === value ? 'true' : 'false',
        text: `${label} ${count}`,
        onclick: () => {
          filter = value;
          shown = SAVED_PAGE;
          render(`[data-og-saved-filter="${value || 'ALL'}"]`);
        },
      });
    /* only kinds that have something saved: no empty tab */
    return el('div', { class: 'og-filters', role: 'group', 'aria-label': '종류별로 보기' }, button('', '전체', total), SAVED_TYPES.filter((t) => counts[t] > 0).map((t) => button(t, SAVED_TYPE_LABELS[t], counts[t])));
  }

  function itemRow(item) {
    const a = savedActions(item);
    const check = typeof origins[item.type] === 'function' ? origins[item.type] : null;
    const gone = check ? check(item.id) === false : false;
    return el(
      'li',
      { class: 'og-item og-item--saved', 'data-og-saved-key': item.key, 'data-og-saved-type': item.type, 'data-og-saved-local': a.localOnly ? 'true' : null },
      el(
        'div',
        { class: 'og-item__body' },
        el('p', { class: 'og-item__type', text: a.localOnly ? `${a.typeLabel} · 이 기기에만` : a.typeLabel }),
        el('h3', { class: 'og-item__heading' }, el('span', { class: 'og-item__title', text: item.title })),
        item.description ? el('p', { class: 'og-item__desc', text: item.description }) : null,
        el('p', { class: 'og-item__meta', text: [`${formatDate(item.savedAt)} 저장`, item.source ? `자료: ${item.source}` : ''].filter(Boolean).join(' · ') }),
        gone ? el('p', { class: 'og-item__desc og-item__gone', 'data-og-saved-gone': 'true', text: '현재 원본 정보를 불러올 수 없어요. 원래 글이 지워져 저장한 제목만 남아 있어요.' }) : null
      ),
      el(
        'div',
        { class: 'og-item__actions' },
        a.ownerRoute ? el('a', { class: 'og-btn og-btn--ghost', href: a.ownerRoute, 'data-og-saved-open': 'owner', 'aria-label': `‘${item.title}’ — ${a.ownerLabel}`, text: a.ownerLabel }) : null,
        a.externalUrl ? el('a', { class: 'og-btn og-btn--ghost', href: a.externalUrl, target: '_blank', rel: 'noopener noreferrer', 'data-og-saved-open': 'external', 'aria-label': `‘${item.title}’ ${a.externalLabel}`, text: a.externalLabel }) : null,
        el('button', {
          type: 'button',
          class: 'og-btn og-btn--ghost',
          'data-og-saved-remove': item.key,
          'aria-label': `‘${item.title}’ 저장 취소`,
          text: '저장 취소',
          onclick: () => {
            /* Product Completion Audit V1: only a removal that was written is announced */
            const removed = saved.unsave(item.type, item.id);
            announce(status, removed ? `‘${item.title}’ 저장을 취소했습니다.` : '저장을 취소하지 못했어요. 브라우저의 저장 공간을 확인한 뒤 다시 해 주세요.');
            /* the row is gone after the list re-renders: keep focus on the screen */
            const next = host.querySelector('[data-og-saved-filter]') || document.getElementById('og-saved-title');
            if (next) next.focus();
          },
        })
      )
    );
  }

  function render(focusSelector) {
    const total = saved.count();
    clear(host);
    if (total === 0) {
      filter = '';
      host.dataset.ogSavedState = 'empty';
      host.append(
        el(
          'div',
          { class: 'og-empty-card' },
          el('h2', { class: 'og-empty-card__title', text: '아직 저장한 것이 없습니다' }),
          el('p', { text: '돌봄·서비스, 즐길거리, 스토어에서 마음에 드는 것을 저장하면 여기에서 다시 볼 수 있습니다. 커뮤니티에서 쓴 내 글도 저장할 수 있습니다.' }),
          el('p', { text: '저장한 내용은 이 기기에만 보관됩니다.' })
        ),
        status
      );
      return;
    }
    const counts = saved.counts();
    /* the chosen kind may have just lost its last item */
    if (filter && !counts[filter]) filter = '';
    const items = saved.list({ type: filter });
    const page = items.slice(0, shown);
    host.dataset.ogSavedState = 'filled';
    host.append(
      filters(counts, total),
      el('p', { class: 'og-state og-saved-count', 'data-og-saved-count': String(items.length), text: `${filter ? SAVED_TYPE_LABELS[filter] : '전체'} ${items.length}개${items.length > page.length ? ` 가운데 ${page.length}개를 보여 드려요` : ''}` }),
      el('ul', { class: 'og-items', 'aria-label': '저장한 항목' }, page.map(itemRow))
    );
    if (items.length > page.length) {
      host.append(
        el('div', { class: 'og-form__actions' }, el('button', {
          type: 'button',
          class: 'og-btn og-btn--ghost',
          'data-og-saved-more': 'true',
          text: `더 보기 (${items.length - page.length}개 남음)`,
          onclick: () => {
            const first = shown;
            shown += SAVED_PAGE;
            render();
            const row = host.querySelectorAll('.og-item')[first];
            const target = row && row.querySelector('a, button');
            if (target) target.focus();
          },
        }))
      );
    }
    host.append(el('p', { class: 'og-item__desc og-saved-note', 'data-og-saved-note': 'snapshot', text: SNAPSHOT_NOTE }), status);
    if (focusSelector) {
      const target = host.querySelector(focusSelector);
      if (target) target.focus();
    }
  }

  storage.subscribe((change) => {
    if (change.collection === 'saved') render();
  });
  render();
  return Object.freeze({ render });
}
