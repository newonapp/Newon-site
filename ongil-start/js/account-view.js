/*
 * 내 정보 (Account / Profile) view — local mode.
 *
 * Shows plainly that ONGIL is being used on this device without sign-in, lets the user edit the profile,
 * viewing preferences and notification preferences, restart onboarding, and erase ONGIL's own data.
 * The Newon+ account connection has one reserved place here ([data-og-account-connect]); it is a statement
 * of the current state, not a button, because no account service exists yet.
 */
import { el, clear, announce } from './dom.js';
import { AGE_RANGES, REGIONS, INTERESTS, NEEDS, USAGE_MODES, TEXT_SIZES, MOTION_MODES, LIMITS } from './contracts.js';

let uid = 0;
const nextId = (p) => `og-${p}-${++uid}`;

function field(label, control, hint) {
  const id = control.id || nextId('f');
  control.id = id;
  const hintId = hint ? `${id}-hint` : null;
  if (hintId) control.setAttribute('aria-describedby', hintId);
  return el('div', { class: 'og-field' }, el('label', { class: 'og-field__label', for: id, text: label }), control, hint ? el('p', { class: 'og-field__hint', id: hintId, text: hint }) : null);
}

function selectOf(name, options, value, emptyLabel) {
  return el('select', { class: 'og-input', name }, el('option', { value: '', text: emptyLabel, selected: value === '' }), options.map((o) => el('option', { value: o.id, text: o.label, selected: o.id === value })));
}

/* fieldset of checkboxes or radios; the native control stays visible so state is never shown by colour alone */
function choices(type, name, legend, options, selected, hint) {
  const isOn = (id) => (Array.isArray(selected) ? selected.includes(id) : selected === id);
  return el(
    'fieldset',
    { class: 'og-choices' },
    el('legend', { class: 'og-field__label', text: legend }),
    hint ? el('p', { class: 'og-field__hint', text: hint }) : null,
    el('div', { class: 'og-choices__list' }, options.map((o) => el('label', { class: 'og-choice' }, el('input', { type, name, value: o.id, checked: isOn(o.id) }), el('span', { text: o.label }))))
  );
}

function section(title, ...children) {
  const id = nextId('sec');
  return el('section', { class: 'og-panelcard', 'aria-labelledby': id }, el('h2', { class: 'og-panelcard__title', id, text: title }), children);
}

export function createAccountView({ host, profile, account, notifications, onboarding, storage, onPreferencesChange, onOpenOnboarding, onErased }) {
  const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });

  function modeSection() {
    const s = account.state();
    return section(
      '사용 상태',
      el('p', { class: 'og-mode' }, el('strong', { text: '이 기기에서만 사용 중' }), ' — 로그인 없이 쓰고 있습니다.'),
      el('p', { text: '입력한 내용은 이 브라우저에만 저장됩니다. 브라우저 데이터를 지우거나 다른 기기에서 열면 보이지 않습니다.' }),
      s.persistent ? null : el('p', { class: 'og-notice', role: 'note', text: '이 브라우저에서는 저장이 막혀 있습니다. 창을 닫으면 입력한 내용이 사라집니다.' }),
      el('p', { 'data-og-account-connect': s.mode, text: 'Newon+ 계정 연결은 아직 제공되지 않습니다. 계정이 없어도 ONGIL을 그대로 쓸 수 있습니다.' })
    );
  }

  function profileSection() {
    const p = profile.getProfile();
    const form = el(
      'form',
      { class: 'og-form', novalidate: true },
      field('부를 이름 (별명)', el('input', { class: 'og-input', type: 'text', name: 'nickname', value: p.nickname, maxlength: LIMITS.nickname, autocomplete: 'nickname' }), '실명이 아니어도 됩니다. 20자까지 쓸 수 있습니다.'),
      choices('radio', 'usageMode', '누가 사용하나요?', USAGE_MODES, p.usageMode),
      field('연령대', selectOf('ageRange', AGE_RANGES, p.ageRange, '선택 안 함')),
      field('사는 지역', selectOf('region', REGIONS, p.region, '선택 안 함')),
      choices('checkbox', 'interests', '관심 있는 것', INTERESTS, p.interests, '여러 개를 고를 수 있습니다.'),
      choices('checkbox', 'needs', '필요한 도움', NEEDS, p.needs, '여러 개를 고를 수 있습니다.'),
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '내 정보 저장' }))
    );
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const result = profile.updateProfile({
        nickname: String(data.get('nickname') || ''),
        usageMode: String(data.get('usageMode') || ''),
        ageRange: String(data.get('ageRange') || ''),
        region: String(data.get('region') || ''),
        interests: data.getAll('interests').map(String),
        needs: data.getAll('needs').map(String),
      });
      announce(status, result.ok ? '내 정보를 저장했습니다.' : '저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');
    });
    return section('내 정보', el('p', { text: '모두 선택 사항입니다. 전화번호, 주소, 건강 정보는 묻지 않습니다.' }), form);
  }

  function viewingSection() {
    const prefs = profile.getPreferences();
    const form = el('form', { class: 'og-form', novalidate: true }, choices('radio', 'textSize', '글자 크기', TEXT_SIZES, prefs.textSize), choices('radio', 'motion', '배경 영상', MOTION_MODES, prefs.motion, '영상을 멈추면 움직이지 않는 화면으로 보입니다.'));
    form.addEventListener('change', () => {
      const data = new FormData(form);
      const result = profile.updatePreferences({ textSize: String(data.get('textSize') || 'default'), motion: String(data.get('motion') || 'system') });
      if (typeof onPreferencesChange === 'function') onPreferencesChange(result.preferences);
      announce(status, result.ok ? '보기 설정을 바꿨습니다.' : '설정을 저장하지 못했습니다.');
    });
    return section('보기 설정', form);
  }

  function notificationSection() {
    const list = el(
      'fieldset',
      { class: 'og-choices' },
      el('legend', { class: 'og-field__label', text: 'ONGIL 안에서 보고 싶은 알림 종류' }),
      el(
        'div',
        { class: 'og-choices__list' },
        notifications.preferences().map((t) =>
          el(
            'label',
            { class: 'og-choice' },
            el('input', {
              type: 'checkbox',
              name: 'notify',
              value: t.id,
              checked: t.enabled,
              onchange: (event) => {
                const r = notifications.setPreference(t.id, event.target.checked);
                announce(status, r.ok ? `${t.label} 알림을 ONGIL 안에서 ${event.target.checked ? '보도록' : '보지 않도록'} 골라 두었습니다.` : '설정을 저장하지 못했습니다.');
              },
            }),
            el('span', { text: t.label })
          )
        )
      )
    );
    return section(
      '알림 설정',
      el('p', { class: 'og-notice', role: 'note', text: '알림을 보내는 기능은 아직 연결되지 않았습니다. 지금은 선택한 내용만 저장해 둡니다.' }),
      /* Phase 8: say exactly what a choice does and does not do */
      el('p', { class: 'og-notice', role: 'note', 'data-og-note-delivery': 'in-app', text: '아직 ONGIL이 만드는 알림은 없어요. 고른 종류는 나중에 ONGIL 안의 알림 목록에 쓰여요. 휴대폰 알림(푸시), 문자, 이메일은 보내지 않아요.' }),
      list
    );
  }

  function familySection() {
    const p = profile.getProfile();
    return section(
      '가족 연결',
      el('p', { 'data-og-family-status': 'NOT_AVAILABLE', text: '가족 연결은 아직 할 수 없습니다. 연결된 가족이 없습니다.' }),
      p.familyIntent === 'now' ? el('p', { text: '가족과 연결하고 싶다고 표시해 두셨습니다. 기능이 준비되면 이 자리에서 연결할 수 있습니다.' }) : null
    );
  }

  function setupSection() {
    const s = onboarding.state();
    const label = s.status === 'completed' ? '처음 설정 다시 하기' : s.status === 'new' ? '처음 설정 시작하기' : '처음 설정 이어서 하기';
    return section('처음 설정', el('p', { text: '질문 7개로 지역과 알림을 정해 둡니다. 답하지 않고 넘어가도 됩니다.' }), el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: label, onclick: (event) => onOpenOnboarding(event.currentTarget) })));
  }

  function dataSection() {
    const confirmBox = el('div', { class: 'og-confirm', hidden: true });
    const open = el('button', {
      type: 'button',
      class: 'og-btn og-btn--ghost',
      text: '이 기기의 ONGIL 데이터 지우기',
      'aria-expanded': 'false',
      onclick: () => {
        confirmBox.hidden = false;
        open.setAttribute('aria-expanded', 'true');
        confirmBox.querySelector('button').focus();
      },
    });
    confirmBox.append(
      el('p', { text: '내 정보와 설정, 저장한 항목, 그리고 일정·할 일·루틴·복약·식사·운동·수면·생활비·기록·안부까지 이 기기에서 모두 지웁니다. 증상과 건강 메모, 가족 공유 설정과 도움 요청도 함께 지웁니다. 건강 수치(체중·혈압·혈당·맥박), 병원 일정과 건강검진, 긴급 연락망도 함께 지웁니다. 가족 연결과 초대, 가족에게 보여줄 정보 설정, 활동 기록도 지웁니다. 커뮤니티 글과 모임 초안도 함께 지웁니다. 알림과 이용 횟수도 지웁니다. 되돌릴 수 없습니다.' }),
      el(
        'div',
        { class: 'og-form__actions' },
        el('button', {
          type: 'button',
          class: 'og-btn og-btn--ghost',
          text: '취소',
          onclick: () => {
            confirmBox.hidden = true;
            open.setAttribute('aria-expanded', 'false');
            open.focus();
          },
        }),
        el('button', {
          type: 'button',
          class: 'og-btn og-btn--danger',
          text: '모두 지우기',
          onclick: () => {
            const ok = storage.clear();
            if (typeof onErased === 'function') onErased();
            render();
            announce(status, ok ? '이 기기의 ONGIL 데이터를 모두 지웠습니다.' : '일부 데이터를 지우지 못했습니다.');
            /* the pressed button is gone after the redraw: keep focus on the screen */
            const title = document.getElementById('og-account-title');
            if (title) title.focus();
          },
        })
      )
    );
    return section('데이터 관리', el('p', { text: 'ONGIL이 이 기기에 저장한 내용만 지웁니다. 다른 사이트의 데이터는 건드리지 않습니다.' }), el('div', { class: 'og-form__actions' }, open), confirmBox);
  }

  function render() {
    clear(host);
    host.append(modeSection(), profileSection(), viewingSection(), notificationSection(), familySection(), setupSection(), dataSection(), status);
  }

  render();
  return Object.freeze({ render });
}
