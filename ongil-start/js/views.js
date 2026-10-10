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

/*
 * ONGIL Stability V1 — plain words for a source that did not give a usable answer.
 *
 * data-source.js keeps the existing reasons (NOT_CONNECTED · NOT_CONFIGURED · NO_ANSWER · REGION_REQUIRED …) and adds
 * a `detail` for NO_ANSWER saying what kind of failure it was, read only from what the browser saw:
 *   OFFLINE        the browser says it is offline
 *   NETWORK        the request did not reach the data route (connection, DNS, blocked)
 *   TIMEOUT        no answer within the time limit
 *   UPSTREAM       the route answered 502: the provider behind it did not give a usable answer
 *   UPSTREAM_SLOW  the route answered 504: the provider behind it was too slow
 *   LIMIT          the route answered 503 / 429: too many requests for now
 *   SERVER         any other failure of the route (5xx, an answer that is not { ok: true })
 * No cause is guessed beyond that: the words say what happened, never why a provider failed.
 * NO_ANSWER and the details are temporary, so the screen offers 다시 찾기; NOT_CONFIGURED / NOT_CONNECTED are not.
 */
export const FAILURE_DETAILS = Object.freeze(['OFFLINE', 'NETWORK', 'TIMEOUT', 'UPSTREAM', 'UPSTREAM_SLOW', 'LIMIT', 'SERVER']);

/* 을/를 by the last syllable */
const obj = (w) => {
  const c = w.charCodeAt(w.length - 1);
  return w + (c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '을' : '를');
};

/* a failure the person can fix by trying again later */
export function isRetryable(result) {
  return !!result && result.state === 'unavailable' && result.reason === 'NO_ANSWER';
}

/* subject: what was being looked for, e.g. '기관 정보', '강좌 정보', '자료' */
export function failureText(result, subject = '자료') {
  const s = obj(subject);
  switch (result && result.detail) {
    case 'OFFLINE': return `인터넷이 연결되어 있지 않아 ${s} 받아오지 못했어요. 연결을 확인한 뒤 다시 찾아 주세요.`;
    case 'NETWORK': return `네트워크 문제로 ${s} 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.`;
    case 'TIMEOUT': return `응답이 늦어 ${s} 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.`;
    case 'UPSTREAM': return `${s} 주는 곳이 지금 응답하지 않아요. 잠시 뒤 다시 찾아 주세요.`;
    case 'UPSTREAM_SLOW': return `${s} 주는 곳의 응답이 늦어요. 잠시 뒤 다시 찾아 주세요.`;
    case 'LIMIT': return `지금은 찾는 요청이 많아 ${s} 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.`;
    default: return `지금은 ${s} 받아오지 못했어요. 잠시 뒤 다시 찾아 주세요.`;
  }
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

  /*
   * Product Completion Audit V1: what works and what does not are listed apart. Before, every module sat under
   * "준비 중인 기능 — 아래 항목은 아직 사용할 수 없습니다", including the ones that work (긴급 연락망, 복약 …).
   */
  const chip = (m) =>
    el(
      'li',
      { class: 'og-chip og-chip--slot', 'data-og-slot': `${area.id}.${m.id}`, 'data-og-available': m.available ? 'true' : 'false' },
      el('h4', { text: m.title }),
      el('p', { text: m.description }),
      el('p', { class: 'og-chip__status', text: m.available ? '사용할 수 있음' : '준비 중' })
    );
  const ready = area.modules.filter((m) => m.available);
  const pending = area.modules.filter((m) => !m.available);
  if (ready.length) {
    const readyTitleId = `og-${area.id}-ready-title`;
    wrap.append(
      el('h3', { class: 'og-sub', id: readyTitleId, text: '지금 쓸 수 있는 기능' }),
      el('p', { class: 'og-sub__lead', text: area.readyLead || '아래 기능은 지금 쓸 수 있습니다.' }),
      el('ul', { class: 'og-chips og-chips--slots', 'aria-labelledby': readyTitleId, 'data-og-modules-group': 'ready' }, ready.map(chip))
    );
  }
  if (pending.length) {
    const listTitleId = `og-${area.id}-modules-title`;
    wrap.append(
      el('h3', { class: 'og-sub', id: listTitleId, text: area.id === 'store' ? '준비 중인 분류' : '준비 중인 기능' }),
      el('p', { class: 'og-sub__lead', text: '아래 항목은 아직 사용할 수 없습니다.' }),
      el('ul', { class: 'og-chips og-chips--slots', 'aria-labelledby': listTitleId, 'data-og-modules-group': 'pending' }, pending.map(chip))
    );
  }
  host.append(wrap);
  host.dataset.ogRendered = 'true';
  return host;
}
