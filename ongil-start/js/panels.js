/*
 * Header panels: 통합검색 and 알림.
 *
 * 통합검색 asks the search registry (search.js) and shows exactly what it returns, in one of six states:
 *   empty query · loading · results · partial (a source did not answer, the others did) · no results · error.
 * Every result names what it is (메뉴, 서비스, 프로그램, 장소, 상품 …) and opens its owner screen inside ONGIL.
 * Counts are of what was really found; there are no suggested, popular or trending searches.
 *
 * 알림 is the in-app notification list: read / unread in words, mark one or all as read, remove, open the owner
 * screen. It shows only what is stored — nothing produces a notification yet, and ONGIL sends no push, text or e-mail.
 * At most NOTIFICATION_PAGE rows are in the DOM (+ 더 보기).
 */
import { el, clear, announce, formatDate } from './dom.js';

export const NOTIFICATION_PAGE = 20;
export const SEARCH_SCOPE_NOTE = 'ONGIL 메뉴, 저장한 항목, 그리고 이번 방문에서 화면에 불러온 서비스·기관·프로그램·장소·상품을 찾아요. 건강 기록, 일정, 일기 같은 내 기록은 찾지 않아요.';
export const NO_PUSH_NOTE = '알림은 ONGIL 안에서만 보여요. 휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요.';

/* append, skipping what is absent (Element.append would print the word "null") */
const put = (node, ...kids) => node.append(...kids.filter((k) => k !== null && k !== undefined && k !== false));

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
    if (btn.dataset.ogTool === 'search' && results && !results.dataset.ogSearchState) showScope();
    const first = panel.querySelector('input, a[href], button');
    if (first) first.focus();
  }

  for (const btn of buttons) {
    btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? closeAll({ restoreFocus: true }) : open(btn)));
  }
  /* composedPath: a control that re-renders its own row is already detached when this runs, but it was inside the panel */
  document.addEventListener('click', (event) => {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (!path.includes(root) && !root.contains(event.target)) closeAll();
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
  let ticket = 0;

  const setState = (state) => {
    results.dataset.ogSearchState = state;
    results.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
  };
  function showScope() {
    clear(results);
    setState('empty-query');
    put(results, el('p', { class: 'og-panel__note', 'data-og-search-scope': 'true', text: SEARCH_SCOPE_NOTE }));
  }
  /* the type in words comes first, unless the provider's own description already starts with it */
  const describe = (r) => (!r.typeLabel || (r.description || '').startsWith(r.typeLabel) ? r.description : [r.typeLabel, r.description].filter(Boolean).join(' · '));

  function resultRow(r) {
    const text = describe(r);
    const inner = [el('span', { class: 'og-panel__result-title', text: r.title }), text ? el('span', { class: 'og-panel__result-desc', text }) : null];
    return el('li', { 'data-og-search-type': r.contentType || r.type }, r.route ? el('a', { href: r.route }, inner) : el('span', {}, inner));
  }

  async function runSearch() {
    const mine = ++ticket;
    const input = form.querySelector('input[type="search"]');
    if (!input.value.trim()) {
      showScope();
      announce(searchStatus, '찾을 말을 입력해 주세요.');
      return;
    }
    clear(results);
    setState('loading');
    put(results, el('p', { class: 'og-panel__note', text: '찾고 있어요…' }));
    let outcome;
    try {
      outcome = await search.query(input.value);
    } catch {
      outcome = { query: input.value, state: 'error', results: [], groups: [], failed: [], failedLabels: [], total: 0 };
    }
    if (mine !== ticket) return;
    clear(results);
    setState(outcome.state);
    if (outcome.state === 'empty-query') {
      showScope();
      announce(searchStatus, '찾을 말을 입력해 주세요.');
      return;
    }
    const failedNote = outcome.failedLabels.length ? el('p', { class: 'og-panel__note', role: 'note', 'data-og-search-failed': outcome.failed.join(' '), text: `‘${outcome.failedLabels.join(', ')}’에서는 지금 찾지 못했어요.${outcome.results.length ? ' 나머지 결과만 보여 드려요.' : ''}` }) : null;
    if (outcome.state === 'error') {
      put(results, el('p', { class: 'og-panel__note', text: '지금은 찾지 못했어요. 잠시 뒤 다시 찾아 주세요.' }));
      announce(searchStatus, '지금은 찾지 못했습니다.');
      return;
    }
    if (outcome.results.length === 0) {
      put(results, el('p', { class: 'og-panel__note', text: `‘${outcome.query}’와 맞는 것을 찾지 못했습니다.` }), failedNote, el('p', { class: 'og-panel__note', 'data-og-search-scope': 'true', text: SEARCH_SCOPE_NOTE }));
      announce(searchStatus, '검색 결과가 없습니다.');
      return;
    }
    if (failedNote) put(results, failedNote);
    for (const group of outcome.groups) {
      put(results, 
        el('p', { class: 'og-panel__group', 'data-og-search-group': group.providerId, text: `${group.label} ${group.found}개` }),
        el('ul', { class: 'og-panel__list', 'aria-label': `${group.label} 검색 결과` }, group.results.map(resultRow)),
        group.truncated ? el('p', { class: 'og-panel__note', 'data-og-search-truncated': group.providerId, text: `${group.found}개 가운데 앞의 ${group.results.length}개만 보여 드려요. 찾을 말을 더 자세히 적어 보세요.` }) : null
      );
    }
    announce(searchStatus, outcome.total > outcome.results.length ? `검색 결과 ${outcome.total}개 가운데 ${outcome.results.length}개를 보여 드립니다.` : `검색 결과 ${outcome.results.length}개`);
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
  let shown = NOTIFICATION_PAGE;

  function noteRow(n) {
    const act = (text, label, key, fn) => el('button', { type: 'button', class: 'og-panel__btn', [`data-og-note-${key}`]: n.id, 'aria-label': label, text, onclick: fn });
    return el(
      'li',
      { class: n.read ? 'og-panel__item' : 'og-panel__item is-unread', 'data-og-note': n.id, 'data-og-note-read': n.read ? 'true' : 'false' },
      /* read state in words, not colour */
      el('span', { class: 'og-panel__result-desc', text: `${n.typeLabel} · ${n.read ? '읽음' : '읽지 않음'} · ${formatDate(n.createdAt)}` }),
      el('span', { class: 'og-panel__result-title', text: n.title }),
      n.body ? el('span', { class: 'og-panel__result-desc', text: n.body }) : null,
      el(
        'span',
        { class: 'og-panel__actions' },
        n.route ? el('a', { class: 'og-panel__btn', href: n.route, 'data-og-note-open': n.id, 'aria-label': `‘${n.title}’ 열기`, text: '열기', onclick: () => { notifications.markRead(n.id); updateBadge(); } }) : null,
        n.read ? null : act('읽음으로 표시', `‘${n.title}’ 읽음으로 표시`, 'read', () => { notifications.markRead(n.id); renderNotifications(`[data-og-note-remove="${n.id}"]`); }),
        act('지우기', `‘${n.title}’ 알림 지우기`, 'remove', () => { notifications.remove(n.id); renderNotifications('title'); })
      )
    );
  }

  function renderNotifications(focus) {
    if (!noteHost) return;
    const items = notifications.list();
    const unread = items.filter((n) => !n.read).length;
    clear(noteHost);
    noteHost.dataset.ogNotificationsState = items.length ? 'filled' : 'empty';
    const heading = el('p', { class: 'og-panel__note', tabindex: '-1', 'data-og-note-summary': String(unread), text: items.length ? `알림 ${items.length}개 · 읽지 않은 알림 ${unread}개` : '받은 알림이 없습니다.' });
    put(noteHost, heading);
    if (items.length) {
      if (unread) put(noteHost, el('button', { type: 'button', class: 'og-panel__btn', 'data-og-note-all': 'true', text: '모두 읽음으로 표시', onclick: () => { notifications.markAllRead(); renderNotifications('title'); } }));
      const page = items.slice(0, shown);
      put(noteHost, el('ul', { class: 'og-panel__list', 'aria-label': '알림 목록' }, page.map(noteRow)));
      if (items.length > page.length) {
        put(noteHost, el('button', { type: 'button', class: 'og-panel__btn', 'data-og-note-more': 'true', text: `더 보기 (${items.length - page.length}개 남음)`, onclick: () => { const first = shown; shown += NOTIFICATION_PAGE; renderNotifications(); const row = noteHost.querySelectorAll('[data-og-note]')[first]; const t = row && row.querySelector('a, button'); if (t) t.focus(); } }));
      }
    } else {
      shown = NOTIFICATION_PAGE;
    }
    if (!notifications.delivery.push && !notifications.delivery.server) {
      put(noteHost, el('p', { class: 'og-panel__note', text: '알림을 보내는 기능은 아직 연결되지 않았습니다.' }), el('p', { class: 'og-panel__note', 'data-og-note-delivery': 'in-app', text: NO_PUSH_NOTE }));
    }
    updateBadge();
    if (focus) {
      const target = focus === 'title' ? heading : noteHost.querySelector(focus);
      (target || heading).focus();
    }
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
