/*
 * Home cards that point outward: 가족 · 오늘 뭐 하지? · 내 주변 · 빠른 실행.
 *
 * None of them invents content. 가족 states the real connection status (not available yet). 오늘 뭐 하지?
 * offers the five categories and sends the user to 즐길거리 — there are no programme entries to recommend yet.
 * 내 주변 asks a real data source only when the user presses the button, and says plainly when nothing can be shown.
 */
import { el, clear } from './dom.js';
import { createCard } from './home-ui.js';
import { setRegionState } from './views.js';

/* ───────── 가족 ───────── */

export function createFamilyCard({ familyConnection }) {
  const card = createCard({ slot: 'family-update', title: '가족', level: 3 });
  function render() {
    const state = familyConnection();
    clear(card.body);
    card.root.dataset.ogState = 'empty';
    card.body.append(
      el('p', { class: 'og-home-empty', 'data-og-family-status': state.status, text: '아직 연결된 가족이 없어요.' }),
      el('p', { class: 'og-home-note', text: '가족 연결은 준비 중입니다. 연결하기 전에는 어떤 내용도 가족에게 전달되지 않습니다.' }),
      el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: '#family', text: '가족 화면 보기' }))
    );
  }
  render();
  return { card, render };
}

/* ───────── 오늘 뭐 하지? ───────── */

export const ENJOY_CATEGORIES = Object.freeze(['취미', '배움', '운동', '문화', '나들이']);

/*
 * recommend: an optional source { load() → { state, items } } for later phases. Phase 2A passes none,
 * so the card shows the categories only — no programme, event or place is made up.
 */
export function createEnjoyCard({ recommend = null } = {}) {
  const card = createCard({ slot: 'today', title: '오늘 뭐 하지?', level: 3, lead: '해 보고 싶은 것을 골라 보세요.' });
  function render() {
    clear(card.body);
    card.root.dataset.ogRecommend = recommend ? 'connected' : 'none';
    card.body.append(
      el('ul', { class: 'og-linkchips', 'aria-label': '즐길거리 종류' }, ENJOY_CATEGORIES.map((name) => el('li', {}, el('a', { class: 'og-linkchip', href: '#enjoy', 'aria-label': `${name} — 즐길거리 화면으로 이동` }, name)))),
      el('p', { class: 'og-home-note', text: '추천할 프로그램은 아직 준비 중입니다. 지금은 즐길거리 화면으로 이동합니다.' })
    );
  }
  render();
  return { card, render };
}

/* ───────── 내 주변 ───────── */

export function createNearbyCard({ profile, source, saved }) {
  const card = createCard({ slot: 'nearby', title: '내 주변', level: 4 });
  let ticket = 0;

  function programRow(item) {
    const meta = [item.organizer, item.venue].filter(Boolean).join(' · ');
    const when = [item.period, item.days, item.time].filter(Boolean).join(' · ');
    const savable = saved.isSaved('PROGRAM', item.id) || /^[A-Za-z0-9][A-Za-z0-9._:\-]*$/.test(item.id);
    const isSaved = saved.isSaved('PROGRAM', item.id);
    return el(
      'li',
      { class: 'og-home-item' },
      el(
        'div',
        { class: 'og-home-item__main' },
        el('p', { class: 'og-home-item__title', text: item.title }),
        meta ? el('p', { class: 'og-home-item__meta', text: meta }) : null,
        when ? el('p', { class: 'og-home-item__meta', text: when }) : null,
        item.href ? el('p', { class: 'og-home-item__meta' }, el('a', { href: item.href, target: '_blank', rel: 'noopener noreferrer', text: '운영기관 누리집 (새 창)' })) : null
      ),
      savable
        ? el(
            'div',
            { class: 'og-home-item__actions' },
            el('button', {
              type: 'button',
              class: 'og-btn og-btn--ghost og-btn--small',
              'aria-pressed': isSaved ? 'true' : 'false',
              'aria-label': isSaved ? `‘${item.title}’ 저장 취소` : `‘${item.title}’ 저장`,
              text: isSaved ? '✓ 저장됨' : '저장',
              onclick: (event) => {
                const r = saved.toggle({ type: 'PROGRAM', id: item.id, title: item.title, description: meta, href: item.href, source: item.attribution });
                card.say(r.ok ? (r.saved ? `‘${item.title}’을(를) 저장했습니다.` : `‘${item.title}’ 저장을 취소했습니다.`) : '저장하지 못했습니다.');
                const li = event.currentTarget.closest('li');
                const fresh = programRow(item);
                li.replaceWith(fresh);
                fresh.querySelector('button').focus();
              },
            })
          )
        : null
    );
  }

  function render() {
    ticket += 1;
    const region = profile.getProfile().region;
    clear(card.body);
    const zone = el('div', { class: 'og-region og-home-region', 'data-og-region': 'nearby', role: 'region', 'aria-labelledby': card.titleId });
    if (!region) {
      card.root.dataset.ogState = 'needs-region';
      card.body.append(el('p', { class: 'og-home-empty', text: '사는 지역을 정하면 그 지역의 강좌를 찾아볼 수 있어요.' }), el('div', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--ghost', href: '#account', text: '내 정보에서 지역 정하기' })));
      return;
    }
    card.root.dataset.ogState = 'idle';
    const button = el('button', {
      type: 'button',
      class: 'og-btn og-btn--ghost',
      text: `${region} 지역 강좌 찾아보기`,
      onclick: async () => {
        const mine = ++ticket;
        button.disabled = true;
        clear(zone);
        setRegionState(zone, 'loading', '강좌를 찾고 있습니다.');
        card.root.dataset.ogState = 'loading';
        let result;
        try {
          result = await source.load({ region });
        } catch {
          result = { state: 'unavailable', items: [] };
        }
        if (mine !== ticket) return;
        button.disabled = false;
        clear(zone);
        card.root.dataset.ogState = result.state;
        if (result.state === 'ready') {
          setRegionState(zone, 'ready');
          zone.append(el('ul', { class: 'og-home-items', 'aria-label': `${region} 지역 강좌` }, result.items.map(programRow)), result.attribution ? el('p', { class: 'og-home-note', text: `자료: ${result.attribution}` }) : null);
          card.say(`강좌 ${result.items.length}개를 찾았습니다.`);
        } else if (result.state === 'empty') {
          setRegionState(zone, 'empty', '지금 모집 중인 강좌를 찾지 못했어요.');
        } else {
          /* not an error to the user: the connection simply is not there yet */
          setRegionState(zone, 'empty', '주변 정보는 아직 연결되지 않았어요. 준비되면 이 자리에서 볼 수 있습니다.');
        }
      },
    });
    card.body.append(el('p', { class: 'og-home-note', text: '공공기관이 공개한 평생학습 강좌를 찾아봅니다. 지역 이름만 보내며, 버튼을 눌렀을 때만 찾습니다.' }), el('div', { class: 'og-form__actions' }, button), zone);
  }

  render();
  return { card, render };
}

/* ───────── 빠른 실행 ───────── */

export const QUICK_ACTIONS = Object.freeze([
  Object.freeze({ id: 'add-event', label: '일정 추가', kind: 'action' }),
  Object.freeze({ id: 'add-task', label: '할 일 추가', kind: 'action' }),
  Object.freeze({ id: 'add-medication', label: '약 추가', kind: 'action' }),
  Object.freeze({ id: 'life', label: '내 생활 보기', kind: 'route', href: '#life' }),
  Object.freeze({ id: 'enjoy', label: '즐길거리 찾기', kind: 'route', href: '#enjoy' }),
  Object.freeze({ id: 'care', label: '돌봄·서비스 찾기', kind: 'route', href: '#care' }),
]);

export function createQuickActionsCard({ actions }) {
  const card = createCard({ slot: 'quick-actions', title: '빠른 실행', level: 4 });
  card.body.append(
    el(
      'ul',
      { class: 'og-quick', 'aria-label': '빠른 실행' },
      QUICK_ACTIONS.map((a) =>
        el('li', {}, a.kind === 'route' ? el('a', { class: 'og-quick__item', href: a.href, 'data-og-quick': a.id, text: a.label }) : el('button', { type: 'button', class: 'og-quick__item', 'data-og-quick': a.id, text: a.label, onclick: () => actions[a.id] && actions[a.id]() }))
      )
    )
  );
  return { card, render: () => {} };
}
