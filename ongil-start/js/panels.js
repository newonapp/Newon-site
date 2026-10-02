/*
 * Header panels: 통합검색 and 알림.
 *
 * Search asks the search foundation (search.js) and shows exactly what it returns. With nothing to show it
 * says so and says what can be searched today. There is no hardcoded answer.
 * The notification panel lists real notifications only; Phase 1 has none and says that sending is not connected.
 */
import { el, clear, announce, formatDate } from './dom.js';

export function createPanels({ root, search, notifications }) {
  const buttons = [...root.querySelectorAll('[data-og-tool]')];
  const panelOf = (btn) => document.getElementById(btn.getAttribute('aria-controls'));

  function closeAll({ restoreFocus = false } = {}) {
    for (const btn of buttons) {
      const wasOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', 'false');
      const panel = panelOf(btn);
      if (panel) panel.hidden = true;
      if (wasOpen && restoreFocus) btn.focus();
    }
  }

  function open(btn) {
    closeAll();
    const panel = panelOf(btn);
    if (!panel) return;
    btn.setAttribute('aria-expanded', 'true');
    panel.hidden = false;
    if (btn.dataset.ogTool === 'notifications') renderNotifications();
    const first = panel.querySelector('input, a[href], button');
    if (first) first.focus();
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? closeAll({ restoreFocus: true }) : open(btn)));
  }
  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) closeAll();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && buttons.some((b) => b.getAttribute('aria-expanded') === 'true')) closeAll({ restoreFocus: true });
  });
  root.addEventListener('click', (event) => {
    if (event.target.closest('.og-panel a[href]')) closeAll();
  });

  /* ───────── search ───────── */
  const form = root.querySelector('[data-og-search]');
  const results = root.querySelector('[data-og-search-results]');
  const searchStatus = root.querySelector('[data-og-search-status]');
  const SCOPE = '지금은 ONGIL 메뉴와 저장한 항목을 찾을 수 있습니다. 서비스·프로그램·장소 검색은 아직 준비 중입니다.';
  let ticket = 0;

  async function runSearch() {
    const mine = ++ticket;
    const input = form.querySelector('input[type="search"]');
    const outcome = await search.query(input.value);
    if (mine !== ticket) return;
    clear(results);
    if (!outcome.query) {
      announce(searchStatus, '찾을 말을 입력해 주세요.');
      return;
    }
    if (outcome.results.length === 0) {
      results.append(el('p', { class: 'og-panel__note', text: `‘${outcome.query}’와 맞는 것을 찾지 못했습니다.` }), el('p', { class: 'og-panel__note', text: SCOPE }));
      announce(searchStatus, '검색 결과가 없습니다.');
      return;
    }
    for (const group of outcome.groups) {
      results.append(
        el('p', { class: 'og-panel__group', text: group.label }),
        el(
          'ul',
          { class: 'og-panel__list' },
          group.results.map((r) => el('li', {}, r.href ? el('a', { href: r.href }, el('span', { class: 'og-panel__result-title', text: r.title }), r.description ? el('span', { class: 'og-panel__result-desc', text: r.description }) : null) : el('span', { text: r.title })))
        )
      );
    }
    announce(searchStatus, `검색 결과 ${outcome.results.length}개`);
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      runSearch();
    });
  }

  /* ───────── notifications ───────── */
  const noteHost = root.querySelector('[data-og-notifications]');
  const badge = root.querySelector('[data-og-notification-count]');

  function renderNotifications() {
    if (!noteHost) return;
    const items = notifications.list();
    clear(noteHost);
    if (items.length === 0) noteHost.append(el('p', { class: 'og-panel__note', text: '받은 알림이 없습니다.' }));
    else {
      noteHost.append(el('ul', { class: 'og-panel__list' }, items.map((n) => el('li', {}, n.href ? el('a', { href: n.href, text: n.title }) : el('span', { text: n.title }), el('span', { class: 'og-panel__result-desc', text: formatDate(n.createdAt) })))));
      notifications.markAllRead();
    }
    if (!notifications.delivery.push && !notifications.delivery.server) noteHost.append(el('p', { class: 'og-panel__note', text: '알림을 보내는 기능은 아직 연결되지 않았습니다.' }));
    updateBadge();
  }

  function updateBadge() {
    if (!badge) return;
    const n = notifications.unreadCount();
    badge.hidden = n === 0;
    badge.textContent = n > 0 ? `읽지 않은 알림 ${n}개` : '';
  }

  updateBadge();
  return Object.freeze({ closeAll, updateBadge });
}
