/* Saved view — list, filter by type, remove. Reads and writes only through the saved store. */
import { el, clear, announce, formatDate } from './dom.js';
import { SAVED_TYPES, SAVED_TYPE_LABELS } from './contracts.js';

export function createSavedView({ host, saved, storage }) {
  let filter = '';
  const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });

  function filters(counts, total) {
    const button = (value, label, count) =>
      el('button', {
        type: 'button',
        class: 'og-filter',
        'aria-pressed': filter === value ? 'true' : 'false',
        text: `${label} ${count}`,
        onclick: () => {
          filter = value;
          render();
        },
      });
    return el('div', { class: 'og-filters', role: 'group', 'aria-label': '종류별로 보기' }, button('', '전체', total), SAVED_TYPES.map((t) => button(t, SAVED_TYPE_LABELS[t], counts[t])));
  }

  function itemRow(item) {
    /* [P7] a saved item that points outside ONGIL (a seller or source page) opens in a new window and says so */
    const external = /^https:\/\//.test(item.href || '');
    const title = item.href ? el('a', { class: 'og-item__title', href: item.href, target: external ? '_blank' : null, rel: external ? 'noopener noreferrer' : null, 'aria-label': external ? `${item.title} (새 창)` : null, text: item.title }) : el('span', { class: 'og-item__title', text: item.title });
    return el(
      'li',
      { class: 'og-item', 'data-og-saved-key': item.key },
      el(
        'div',
        { class: 'og-item__body' },
        el('p', { class: 'og-item__type', text: SAVED_TYPE_LABELS[item.type] }),
        el('h3', { class: 'og-item__heading' }, title),
        item.description ? el('p', { class: 'og-item__desc', text: item.description }) : null,
        el('p', { class: 'og-item__meta', text: `${formatDate(item.savedAt)} 저장` })
      ),
      el('button', {
        type: 'button',
        class: 'og-btn og-btn--ghost',
        'aria-label': `‘${item.title}’ 저장 취소`,
        text: '저장 취소',
        onclick: () => {
          saved.unsave(item.type, item.id);
          announce(status, `‘${item.title}’ 저장을 취소했습니다.`);
        },
      })
    );
  }

  function render() {
    const total = saved.count();
    const items = saved.list({ type: filter });
    clear(host);
    if (total === 0) {
      filter = '';
      host.append(
        el(
          'div',
          { class: 'og-empty-card' },
          el('h2', { class: 'og-empty-card__title', text: '아직 저장한 것이 없습니다' }),
          el('p', { text: '서비스, 프로그램, 장소, 글, 상품을 볼 수 있게 되면 마음에 드는 것을 저장해 여기에서 다시 볼 수 있습니다.' }),
          el('p', { text: '저장한 내용은 이 기기에만 보관됩니다.' })
        ),
        status
      );
      return;
    }
    host.append(filters(saved.counts(), total));
    if (items.length === 0) host.append(el('p', { class: 'og-state', text: `저장한 ‘${SAVED_TYPE_LABELS[filter]}’ 항목이 없습니다.` }));
    else host.append(el('ul', { class: 'og-items', 'aria-label': '저장한 항목' }, items.map(itemRow)));
    host.append(status);
  }

  storage.subscribe((change) => {
    if (change.collection === 'saved') render();
  });
  render();
  return Object.freeze({ render });
}
