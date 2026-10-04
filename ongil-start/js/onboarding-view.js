/*
 * Onboarding dialog — one short question per screen.
 *
 * Opens only when the user asks (the Home invitation, the hero "시작하기" button, or 내 정보).
 * "나중에 하기" and Escape leave at any step; the draft is kept and nothing is applied until the end.
 * Uses the native <dialog> element: focus stays inside while it is open and returns to the opener on close.
 */
import { el, clear } from './dom.js';
import { USAGE_MODES, AGE_RANGES, REGIONS, INTERESTS, NEEDS, NOTIFICATION_PRESETS, FAMILY_INTENTS } from './contracts.js';

const COPY = Object.freeze({
  welcome: { title: 'ONGIL에 오신 것을 환영합니다', lead: '몇 가지만 알려 주세요. 지역은 주변 찾기의 기본값으로, 알림 선택은 알림 설정으로 쓰고, 나머지는 내 정보에 적어 둡니다. 질문은 7개이고, 답하지 않고 넘어가도 됩니다.', note: '회원가입은 필요 없습니다. 답한 내용은 이 기기에만 저장됩니다.' },
  usage: { title: 'ONGIL을 누가 사용하나요?', type: 'radio', options: USAGE_MODES },
  age: { title: '연령대를 알려 주세요', type: 'radio', options: AGE_RANGES },
  region: { title: '사는 지역은 어디인가요?', type: 'select', options: REGIONS },
  interests: { title: '관심 있는 것을 골라 주세요', lead: '여러 개를 고를 수 있습니다.', type: 'checkbox', options: INTERESTS },
  needs: { title: '어떤 도움이 필요하신가요?', lead: '여러 개를 고를 수 있습니다.', type: 'checkbox', options: NEEDS },
  notifications: { title: '어떤 알림을 받고 싶으신가요?', type: 'radio', options: NOTIFICATION_PRESETS, note: '알림을 보내는 기능은 아직 연결되지 않았습니다. 지금은 고른 내용만 저장해 둡니다. 휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요.' },
  family: { title: '가족과 연결하고 싶으신가요?', type: 'radio', options: FAMILY_INTENTS, note: '가족 연결 기능은 아직 준비 중입니다. ‘지금 연결하고 싶어요’를 골라도 지금은 연결되지 않으며, 원하신다는 것만 적어 둡니다.' },
  complete: { title: '준비가 끝났습니다', lead: '답해 주신 내용을 이 기기에 저장했습니다. 내 정보에서 언제든 바꿀 수 있습니다.' },
});

export function createOnboardingView({ dialog, onboarding, onClose }) {
  const body = dialog.querySelector('[data-og-onboarding-body]');
  let opener = null;

  function collect(step) {
    const spec = COPY[step];
    if (!spec || !spec.type) return;
    if (spec.type === 'select') {
      const sel = body.querySelector('select');
      onboarding.answer(step, sel ? sel.value : '');
    } else if (spec.type === 'radio') {
      const on = body.querySelector('input[type="radio"]:checked');
      onboarding.answer(step, on ? on.value : '');
    } else {
      onboarding.answer(step, [...body.querySelectorAll('input[type="checkbox"]:checked')].map((i) => i.value));
    }
  }

  function control(step, spec, value) {
    if (spec.type === 'select') {
      return el(
        'div',
        { class: 'og-field' },
        el('label', { class: 'visually-hidden', for: 'og-onb-select', text: spec.title }),
        el('select', { class: 'og-input', id: 'og-onb-select', name: step }, el('option', { value: '', text: '선택 안 함', selected: value === '' }), spec.options.map((o) => el('option', { value: o.id, text: o.label, selected: o.id === value })))
      );
    }
    const isOn = (id) => (Array.isArray(value) ? value.includes(id) : value === id);
    return el(
      'fieldset',
      { class: 'og-choices og-choices--stack' },
      el('legend', { class: 'visually-hidden', text: spec.title }),
      el('div', { class: 'og-choices__list' }, spec.options.map((o) => el('label', { class: 'og-choice' }, el('input', { type: spec.type, name: step, value: o.id, checked: isOn(o.id) }), el('span', { text: o.label }))))
    );
  }

  function render({ focusTitle = true } = {}) {
    const s = onboarding.state();
    const step = s.step;
    const spec = COPY[step];
    clear(body);

    const title = el('h2', { class: 'og-dialog__title', id: 'og-onboarding-title', tabindex: '-1', text: spec.title });
    const progress = s.questionNumber > 0 ? el('p', { class: 'og-dialog__progress', text: `질문 ${s.questionNumber} / ${s.totalQuestions}` }) : null;
    if (progress) body.append(progress);
    body.append(title);
    if (spec.lead) body.append(el('p', { class: 'og-dialog__lead', text: spec.lead }));
    if (spec.type) body.append(control(step, spec, s.answers[step]));
    if (spec.note) body.append(el('p', { class: 'og-notice', role: 'note', text: spec.note }));

    const actions = el('div', { class: 'og-dialog__actions' });
    if (step === 'welcome') {
      actions.append(el('button', { type: 'button', class: 'og-btn og-btn--primary', text: '시작하기', onclick: () => (onboarding.next(), render()) }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '나중에 하기', onclick: () => close('skip') }));
    } else if (step === 'complete') {
      if (s.answers.family === 'now') body.append(el('p', { class: 'og-notice', role: 'note', text: '가족 연결은 아직 할 수 없습니다. 연결하고 싶다고 적어 두었으며, 기능이 준비되면 내 정보에서 연결할 수 있습니다.' }));
      actions.append(el('button', { type: 'button', class: 'og-btn og-btn--primary', text: '홈으로', onclick: () => close('done') }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '내 정보 보기', onclick: () => close('account') }));
    } else {
      actions.append(
        el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '이전', onclick: () => (collect(step), onboarding.back(), render()) }),
        el('button', { type: 'button', class: 'og-btn og-btn--primary', text: step === 'family' ? '마치기' : '다음', onclick: () => (collect(step), onboarding.next(), render()) }),
        el('button', { type: 'button', class: 'og-btn og-btn--text', text: '나중에 하기', onclick: () => (collect(step), close('skip')) })
      );
    }
    body.append(actions);
    if (focusTitle) title.focus();
  }

  function open(from) {
    opener = from || document.activeElement;
    onboarding.start();
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    render();
  }

  function close(reason) {
    if (reason === 'skip') onboarding.skip();
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    const target = opener;
    opener = null;
    if (typeof onClose === 'function') onClose({ reason, state: onboarding.state() });
    if (reason !== 'account' && target && typeof target.focus === 'function' && document.contains(target)) target.focus();
  }

  /* Escape */
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    const s = onboarding.state();
    if (s.step !== 'complete' && s.step !== 'welcome') collect(s.step);
    close(s.step === 'complete' ? 'done' : 'skip');
  });

  return Object.freeze({ open, close, isOpen: () => dialog.open === true });
}

/* The small, non-blocking invitation shown on Home. Never a forced dialog. */
export function renderInvitation({ host, onboarding, onOpen }) {
  clear(host);
  const s = onboarding.state();
  if (s.status === 'completed') return;
  const fresh = s.status === 'new';
  host.append(
    el(
      'div',
      { class: 'og-invite', role: 'region', 'aria-label': '처음 설정' },
      el('h3', { class: 'og-invite__title', text: fresh ? '처음 오셨나요?' : '처음 설정을 마치지 않았습니다' }),
      el('p', { text: fresh ? '질문 7개로 지역과 알림을 미리 정해 둘 수 있습니다. 회원가입은 필요 없고, 나중에 해도 됩니다.' : '남은 질문에 답하면 지역과 알림 설정을 마칩니다. 내 정보에서도 언제든 할 수 있습니다.' }),
      el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--primary', text: fresh ? '처음 설정 시작하기' : '이어서 하기', onclick: (event) => onOpen(event.currentTarget) }))
    )
  );
}
