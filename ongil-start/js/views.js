/*
 * View shells for the eight primary areas.
 *
 * Each area renders: header (label · title · description) → notice (when the area has limits worth stating)
 * → primary content region with an honest empty state → the module slots later phases fill.
 * No sample data is rendered anywhere.
 */
import { el, clear } from './dom.js';

export const REGION_STATES = Object.freeze(['loading', 'empty', 'error', 'ready']);

/* One way to show loading / empty / error in any content region, so later phases do not each invent one. */
export function setRegionState(region, state, message = '') {
  if (!REGION_STATES.includes(state)) throw new Error('INVALID_REGION_STATE');
  region.dataset.ogState = state;
  region.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
  const old = region.querySelector(':scope > [data-og-region-status]');
  if (old) old.remove();
  if (state === 'ready') return;
  const text = message || (state === 'loading' ? '불러오는 중입니다.' : state === 'error' ? '내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' : '아직 내용이 없습니다.');
  region.append(el('p', { class: state === 'error' ? 'og-state og-state--error' : 'og-state', 'data-og-region-status': state, role: state === 'error' ? 'alert' : 'status', text }));
}

export function renderArea(area, host) {
  clear(host);
  const headingId = `og-${area.id}-section-title`;
  const wrap = el('div', { class: 'og-wrap' });
  wrap.append(
    el('p', { class: 'og-label', lang: 'en', text: area.wordmark }),
    el('h2', { class: 'og-h', id: headingId, tabindex: '-1', text: area.label }),
    el('p', { class: 'og-lead', text: area.description })
  );
  if (area.notice) wrap.append(el('p', { class: 'og-notice', role: 'note' }, el('strong', { text: '알려 드립니다. ' }), area.notice));

  /* slot for content added above the modules (for example the onboarding invitation on Home) */
  wrap.append(el('div', { class: 'og-extra', 'data-og-extra': area.id }));

  const primary = el('div', { class: 'og-region', 'data-og-region': 'primary', 'aria-labelledby': headingId, role: 'region' });
  setRegionState(primary, 'empty', area.empty);
  /* an area whose records are kept on another screen says where (Phase 3: 건강·안부 → 내 생활 › 건강) */
  if (area.link) primary.append(el('p', { class: 'og-form__actions' }, el('a', { class: 'og-btn og-btn--primary', href: area.link.href, 'data-og-area-link': area.id, text: area.link.label })));
  wrap.append(primary);

  if (area.modules.length) {
    const listTitleId = `og-${area.id}-modules-title`;
    wrap.append(
      el('h3', { class: 'og-sub', id: listTitleId, text: area.id === 'store' ? '준비 중인 분류' : '준비 중인 기능' }),
      el('p', { class: 'og-sub__lead', text: '아래 항목은 아직 사용할 수 없습니다.' }),
      el(
        'ul',
        { class: 'og-chips og-chips--slots', 'aria-labelledby': listTitleId },
        area.modules.map((m) =>
          el(
            'li',
            { class: 'og-chip og-chip--slot', 'data-og-slot': `${area.id}.${m.id}`, 'data-og-available': m.available ? 'true' : 'false' },
            el('h4', { text: m.title }),
            el('p', { text: m.description }),
            el('p', { class: 'og-chip__status', text: m.available ? '사용할 수 있음' : '준비 중' })
          )
        )
      )
    );
  }
  host.append(wrap);
  host.dataset.ogRendered = 'true';
  return host;
}
