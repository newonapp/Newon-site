/*
 * 가족 연결 (Family Connection V1) — the screens for connecting family, deciding what each one is shown,
 * stopping, disconnecting, asking for help and reading what happened. Built from the existing ONGIL parts only
 * (cards, fields, choices, confirm boxes, lists): no new look.
 *
 * Everything shown comes from family-service.js. This file holds no rule of its own about who may see what.
 *
 * What is true in V1, and what the screen says: connections are kept on THIS device. A family member on another
 * phone cannot be reached until Newon+ accounts and a family server exist. Accepting an invitation, the family
 * view and answering a help request are therefore done here, on this device, and are labelled that way.
 */
import { el, clear, append } from './dom.js';
import { makeField, nextId } from './home-ui.js';
import { formatInvitationCode, LEVEL_LABELS, FAMILY_LIMITS, FAMILY_HELP_KINDS, HELP_STATE_LABELS, ACTIVITY_ACTIONS, MEMBER_ROLES, RELATIONSHIPS } from './family-domain.js';
import { formatDay } from './dates.js';

const put = (node, ...kids) => append(node, kids);
const labelOf = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
const STORAGE_TEXT = '이 기기에 저장하지 못했어요. 브라우저의 저장 공간을 확인한 뒤 다시 해 주세요.';
export const LOCAL_NOTICE = '지금은 이 기기 안에서만 연결돼요. 다른 휴대폰이나 컴퓨터에 있는 가족과 연결하려면 Newon+ 계정이 필요하고, 그 기능은 아직 열리지 않았어요.';
const INVITE_TEXT = { INVALID_CODE: '초대 코드를 다시 확인해 주세요. 글자 20개예요.', NOT_FOUND: '이 기기에서 만든 초대 가운데 그런 코드가 없어요.', EXPIRED: '초대 기간이 끝났어요. 새 초대를 만들어 주세요.', REVOKED: '취소한 초대예요.', DECLINED: '받지 않기로 한 초대예요.', ACCEPTED: '이미 연결에 쓴 초대예요.', LIMIT_MEMBERS: `가족은 ${FAMILY_LIMITS.members}명까지 연결할 수 있어요.`, LIMIT_INVITATIONS: `기다리는 초대는 ${FAMILY_LIMITS.pendingInvitations}개까지 둘 수 있어요. 쓰지 않는 초대를 취소해 주세요.`, INVALID_NAME: '가족을 부르는 이름을 적어 주세요.', NO_SECURE_RANDOM: '이 브라우저에서는 초대 코드를 안전하게 만들 수 없어요.', STORAGE_UNAVAILABLE: STORAGE_TEXT };
const INVITE_STATE_TEXT = { EXPIRED: '초대 기간이 끝났어요', REVOKED: '취소한 초대', DECLINED: '받지 않은 초대' };
const textFor = (map, reason, fallback) => map[reason] || fallback;

export function createFamilyConnectView({ service, cards, onChange }) {
  /* what is open right now. Nothing here is stored: leaving the screen closes it. */
  const ui = { invite: false, lastCode: null, accept: null, revoke: null, member: null, draft: null, consents: [], confirm: null, viewing: null, helpForm: false, helpConfirm: null, focus: null };
  const changed = () => typeof onChange === 'function' && onChange();
  const say = (card, r, okText, map = {}) => card.say(r.ok ? okText : textFor(map, r.reason, r.reason === 'STORAGE_UNAVAILABLE' ? STORAGE_TEXT : '바꾸지 못했어요. 화면을 다시 연 뒤 한 번 더 해 주세요.'));
  const focusLater = (key) => { ui.focus = key; };
  function applyFocus(card) {
    if (!ui.focus) return;
    const target = card.body.querySelector(`[data-og-focus="${ui.focus}"]`);
    if (target) { ui.focus = null; queueMicrotask(() => target.focus()); }
  }
  const btn = (text, cls, attrs, onclick) => el('button', { type: 'button', class: `og-btn og-btn--${cls}`, ...attrs, text, onclick });
  const confirmBox = ({ question, yes, onYes, onNo, key, danger = true }) => {
    const cancel = btn('그대로 두기', 'ghost', { 'data-og-focus': `${key}:cancel` }, onNo);
    queueMicrotask(() => cancel.focus());
    return el('div', { class: 'og-confirm', role: 'group', 'aria-label': '확인', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); onNo(); } } }, el('p', { text: question }), el('div', { class: 'og-form__actions' }, cancel, btn(yes, danger ? 'danger' : 'primary', { 'data-og-family-confirm': key }, onYes)));
  };
  const who = (m) => [labelOf(RELATIONSHIPS, m.relationship), labelOf(MEMBER_ROLES, m.role)].filter(Boolean).join(' · ');

  /* ───────── 연결 상태 · 초대 ───────── */

  function inviteForm(card) {
    const name = makeField({ name: 'displayName', label: '누구를 초대하나요?', type: 'text', required: true, maxlength: FAMILY_LIMITS.name, hint: '내가 부르는 이름을 적어 주세요. 예: 큰딸, 막내' });
    const relation = makeField({ name: 'relationship', label: '관계', type: 'select', required: true, options: service.relationships.map((r) => ({ id: r.id, label: r.label })) }, 'child');
    const role = makeField({ name: 'role', label: '어떤 분인가요?', type: 'select', required: true, options: service.roles.map((r) => ({ id: r.id, label: r.label })), hint: '어느 쪽을 골라도 보이는 정보는 같아요. 보여줄 정보는 연결한 뒤에 내가 따로 골라요.' }, 'FAMILY');
    const expiry = makeField({ name: 'expiry', label: '초대를 받을 수 있는 기간', type: 'select', required: true, options: service.expiryOptions.map((e) => ({ id: e.id, label: e.label })) }, '7d');
    const errorId = nextId('error');
    const error = el('p', { class: 'og-form-error', role: 'alert', id: errorId });
    const close = () => { ui.invite = false; focusLater('invite-open'); renderConnect(); };
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '가족 초대 만들기', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } } },
      name.node, relation.node, role.node, expiry.node, error,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '초대 만들기' }), btn('취소', 'ghost', {}, close)));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const r = service.createInvitation({ displayName: name.get(), relationship: relation.get(), role: role.get(), expiry: expiry.get() });
      if (!r.ok) {
        error.textContent = textFor(INVITE_TEXT, r.reason, '초대를 만들지 못했어요. 다시 해 주세요.');
        name.input.setAttribute('aria-invalid', 'true');
        name.input.setAttribute('aria-describedby', errorId);
        name.input.focus();
        return;
      }
      ui.invite = false;
      ui.lastCode = r.invitation.id;
      card.say(`${r.invitation.displayName}님 초대를 만들었어요. 아래 초대 코드를 확인해 주세요.`);
      focusLater(`code:${r.invitation.id}`);
      renderAll();
      changed();
    });
    queueMicrotask(() => name.input.focus());
    return form;
  }

  function acceptPanel(card) {
    const a = ui.accept;
    const codeField = makeField({ name: 'code', label: '초대 코드', type: 'text', required: true, maxlength: 40, hint: '글자 20개예요. 띄어쓰기나 줄(-)은 있어도 없어도 돼요.' }, a.code || '');
    codeField.input.setAttribute('autocapitalize', 'characters');
    const errorId = nextId('error');
    const error = el('p', { class: 'og-form-error', role: 'alert', id: errorId, text: a.error || '' });
    const close = () => { ui.accept = null; focusLater('accept-open'); renderConnect(); };
    if (a.invitation) {
      const i = a.invitation;
      const no = btn('받지 않기', 'ghost', {}, () => { const r = service.declineInvitation(a.code); ui.accept = null; say(card, r, `${i.displayName}님 초대를 받지 않았어요.`, INVITE_TEXT); focusLater('invite-open'); renderAll(); changed(); });
      queueMicrotask(() => no.focus());
      return el('div', { class: 'og-confirm', role: 'group', 'aria-label': '초대 확인', 'data-og-family-accept': 'confirm', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } } },
        el('p', {}, el('strong', { text: `‘${i.displayName}’(${who(i)}) 초대예요.` })),
        el('ul', { class: 'og-family-points' },
          el('li', { text: '연결해도 처음에는 아무것도 보이지 않아요.' }),
          el('li', { text: '무엇을 보여 줄지는 ONGIL을 쓰는 본인이 가족마다 따로 골라요.' }),
          el('li', { text: '본인이 언제든 공유를 멈추거나 연결을 해제할 수 있어요.' })),
        el('p', { class: 'og-home-note', text: '이 기기에서 가족 역할로 받아 보는 거예요. 다른 기기의 가족에게는 아직 전달되지 않아요.' }),
        el('div', { class: 'og-form__actions' }, no, btn('연결하기', 'primary', { 'data-og-family-accept': 'yes' }, () => {
          const r = service.acceptInvitation(a.code);
          ui.accept = null;
          if (r.ok) { ui.member = r.member.id; ui.draft = null; ui.consents = []; }
          say(card, r, `${i.displayName}님과 이 기기 안에서 연결했어요. 아직 아무것도 공유하지 않아요. 아래에서 보여줄 정보를 골라 주세요.`, INVITE_TEXT);
          focusLater(r.ok ? `member:${r.member.id}` : 'invite-open');
          renderAll();
          changed();
        })));
    }
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '초대 코드로 연결하기', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } } },
      el('p', { class: 'og-home-note', text: '이 기기에서 만든 초대 코드를 넣으면, 초대받은 가족 쪽에서 보이는 확인 화면을 이 기기에서 그대로 볼 수 있어요.' }),
      codeField.node, error,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '초대 확인하기' }), btn('취소', 'ghost', {}, close)));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const r = service.inspectInvitation(codeField.get());
      ui.accept = r.ok ? { code: codeField.get(), invitation: r.invitation } : { code: codeField.get(), error: textFor(INVITE_TEXT, r.reason, '초대를 확인하지 못했어요.') };
      renderConnect();
      if (!r.ok) queueMicrotask(() => { const input = card.body.querySelector('input[name="code"]'); if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); } });
    });
    if (!a.error) queueMicrotask(() => codeField.input.focus());
    return form;
  }

  function renderConnect() {
    const card = cards.connect;
    const o = service.overview();
    clear(card.body);
    card.root.dataset.ogState = o.connected.length ? 'connected' : o.pending.length ? 'pending' : 'not-connected';
    card.root.dataset.ogFamilyMode = o.mode;
    if (!o.connected.length) put(card.body, el('p', { class: 'og-home-empty', 'data-og-family-status': 'NOT_CONNECTED', text: '아직 연결된 가족이 없어요.' }));
    else {
      put(card.body, el('ul', { class: 'og-home-items', 'aria-label': '연결된 가족' }, o.connected.map((m) => el('li', { class: 'og-home-item', 'data-og-family-member': m.id },
        el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.displayName }), el('p', { class: 'og-home-item__meta', text: `${who(m)} · ${m.sharedCount ? `보여 주는 정보 ${m.sharedCount}가지` : '공유하는 정보 없음'}` })),
        el('div', { class: 'og-home-item__actions' }, btn('보여줄 정보 정하기', 'ghost og-btn--small', { 'data-og-focus': `member:${m.id}`, 'aria-label': `${m.displayName}님에게 보여줄 정보 정하기`, 'aria-expanded': ui.member === m.id ? 'true' : 'false' }, () => { ui.member = ui.member === m.id ? null : m.id; ui.draft = null; ui.consents = []; ui.confirm = null; ui.viewing = null; focusLater(ui.member ? 'member-title' : `member:${m.id}`); renderAll(); }))))));
    }
    if (o.pending.length) {
      put(card.body, el('h4', { class: 'og-life-sub', text: '기다리는 초대' }), el('ul', { class: 'og-home-items', 'aria-label': '기다리는 초대' }, o.pending.map((i) => {
        const code = service.invitationCode(i.id);
        const asking = ui.revoke === i.id;
        return el('li', { class: asking ? 'og-home-item og-home-item--confirm' : 'og-home-item', 'data-og-family-invite': i.id },
          el('div', { class: 'og-home-item__main og-home-item__main--plain' },
            el('p', { class: 'og-home-item__title', text: `${i.displayName} (${who(i)})` }),
            el('p', { class: 'og-home-item__meta', text: `초대 대기 중 · ${formatDay(i.expiresAt)}까지` }),
            el('p', { class: 'og-family-code', 'data-og-focus': `code:${i.id}`, tabindex: '-1', 'aria-label': `초대 코드 ${formatInvitationCode(code).split('').join(' ')}` }, el('span', { class: 'og-home-item__meta', text: '초대 코드 ' }), el('strong', { text: formatInvitationCode(code) }))),
          asking
            ? confirmBox({ key: `revoke:${i.id}`, question: `‘${i.displayName}’ 초대를 취소할까요? 이 코드로는 더 연결할 수 없게 돼요.`, yes: '초대 취소', onNo: () => { ui.revoke = null; focusLater(`revoke:${i.id}`); renderConnect(); }, onYes: () => { const r = service.revokeInvitation(i.id); ui.revoke = null; say(card, r, `‘${i.displayName}’ 초대를 취소했어요.`, INVITE_TEXT); focusLater('invite-open'); renderAll(); changed(); } })
            : el('div', { class: 'og-home-item__actions' }, btn('초대 취소', 'ghost og-btn--small', { 'data-og-focus': `revoke:${i.id}`, 'aria-label': `‘${i.displayName}’ 초대 취소` }, () => { ui.revoke = i.id; renderConnect(); })));
      })));
    }
    const ended = o.invitations.filter((i) => INVITE_STATE_TEXT[i.status]).slice(0, 3);
    if (ended.length) put(card.body, el('ul', { class: 'og-family-points', 'aria-label': '끝난 초대' }, ended.map((i) => el('li', { 'data-og-family-invite-state': i.status, text: `${i.displayName}: ${INVITE_STATE_TEXT[i.status]}` }))));
    if (ui.invite) put(card.body, inviteForm(card));
    else if (ui.accept) put(card.body, acceptPanel(card));
    else {
      put(card.body, el('div', { class: 'og-form__actions' },
        btn('가족 연결하기', 'primary', { 'data-og-focus': 'invite-open', 'data-og-family-invite-open': 'true' }, () => { ui.invite = true; ui.accept = null; renderConnect(); }),
        o.pending.length ? btn('초대 코드로 연결 받기', 'ghost', { 'data-og-focus': 'accept-open', 'data-og-family-accept-open': 'true' }, () => { ui.accept = {}; ui.invite = false; renderConnect(); }) : null));
    }
    put(card.body, el('p', { class: 'og-notice', role: 'note', 'data-og-family-scope': 'LOCAL' }, el('strong', { text: '알려 드립니다. ' }), LOCAL_NOTICE),
      el('p', { class: 'og-home-note', text: '초대 코드는 가족에게 직접 알려 주세요. ONGIL은 문자나 카카오톡을 대신 보내지 않아요.' }));
    applyFocus(card);
  }
  /* ───────── 이 가족에게 보여줄 정보 ───────── */

  function sharingForm(card, m) {
    const saved = service.levels(m.id);
    const draft = ui.draft || { ...saved };
    ui.draft = draft;
    const preview = service.previewFor(m.id, draft);
    const need = preview.shared.filter((s) => s.needsConsent);
    ui.consents = ui.consents.filter((id) => need.some((s) => s.id === id));
    const dirty = service.categoryIds.some((id) => draft[id] !== saved[id]);
    const fields = service.categories.map((c) => {
      const legendId = nextId('legend');
      return el('fieldset', { class: 'og-choices og-share', 'data-og-member-share': c.id },
        el('legend', { class: 'og-field__label', id: legendId }, c.label, c.sensitive ? el('span', { class: 'og-field__optional', text: ' (따로 동의가 필요해요)' }) : null),
        el('div', { class: 'og-choices__list' }, c.levels.map((level) => {
          const input = el('input', { type: 'radio', name: `og-member-${m.id}-${c.id}`, value: level, checked: draft[c.id] === level, onchange: () => { ui.draft = { ...draft, [c.id]: level }; focusLater(`level:${c.id}:${level}`); renderMember(); } });
          input.dataset.ogFocus = `level:${c.id}:${level}`;
          return el('label', { class: 'og-choice og-share__opt' }, input, el('span', { text: level === 'NONE' ? '공유 안 함' : `${LEVEL_LABELS[level]} — ${c.words[level]}` }));
        })));
    });
    const consentBox = need.length
      ? el('fieldset', { class: 'og-choices og-confirm', 'data-og-member-consent': 'true' },
          el('legend', { class: 'og-field__label', text: '건강·비상 정보는 한 번 더 확인해요' }),
          el('p', { class: 'og-field__hint', text: `${m.displayName}님에게 보여 주려면 항목마다 표시해 주세요. 표시하지 않으면 저장되지 않아요.` }),
          el('div', { class: 'og-choices__list' }, need.map((s) => {
            const box = el('input', { type: 'checkbox', name: `og-consent-${s.id}`, checked: ui.consents.includes(s.id), onchange: (event) => { ui.consents = event.target.checked ? [...ui.consents, s.id] : ui.consents.filter((id) => id !== s.id); } });
            box.dataset.ogFocus = `consent:${s.id}`;
            return el('label', { class: 'og-choice og-share__opt' }, box, el('span', { text: `‘${s.label}’을(를) ${m.displayName}님에게 보여 주는 데 동의해요 (${s.text})` }));
          })))
      : null;
    const error = el('p', { class: 'og-form-error', role: 'alert' });
    const form = el('form', { class: 'og-form', novalidate: true, 'aria-label': `${m.displayName}님에게 보여줄 정보` }, fields,
      el('section', { class: 'og-home-form', 'data-og-member-preview': dirty ? 'draft' : 'saved', 'aria-label': '이 가족에게 이렇게 보여요' },
        el('h4', { class: 'og-life-sub', text: '이 가족에게 이렇게 보여요' }),
        el('p', { class: 'og-home-note', text: dirty ? '아직 저장하지 않았어요. 저장하면 아래처럼 보여요.' : '지금 저장된 설정이에요.' }),
        el('p', { class: 'og-field__label', text: '공유되는 정보' }),
        preview.shared.length ? el('ul', { class: 'og-life-days', 'aria-label': '공유되는 정보' }, preview.shared.map((s) => el('li', { 'data-og-preview-shared': s.id }, el('span', { class: 'og-life-days__date', text: s.label }), el('span', { class: 'og-life-days__text', text: s.text })))) : el('p', { class: 'og-home-empty', 'data-og-preview-shared': 'none', text: '공유되는 정보가 없어요.' }),
        el('p', { class: 'og-field__label', text: '공유되지 않는 정보' }),
        el('p', { 'data-og-preview-hidden': 'true', text: [...preview.notShared.map((s) => s.label), ...preview.never].join(', ') })),
      consentBox, error,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', 'data-og-focus': 'share-save', disabled: !dirty, text: '저장' }), dirty ? btn('바꾸기 전으로', 'ghost', {}, () => { ui.draft = null; ui.consents = []; focusLater('member-title'); renderMember(); }) : null));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const r = service.applySharing(m.id, draft, { consents: ui.consents });
      if (!r.ok && r.reason === 'CONSENT_REQUIRED') {
        error.textContent = '건강·비상 정보는 항목마다 동의 표시가 있어야 저장할 수 있어요.';
        const first = form.querySelector(`[data-og-focus="consent:${r.categories[0]}"]`);
        if (first) first.focus();
        return;
      }
      /* the connection card's "아직 아무것도 공유하지 않아요" is no longer true once sharing is saved: clear it */
      if (r.ok) { ui.draft = null; ui.consents = []; cards.connect.say(''); }
      say(card, r, `${m.displayName}님에게 보여줄 정보를 저장했어요.`);
      focusLater('member-title');
      renderAll();
      changed();
    });
    return form;
  }

  function familyViewPanel(m) {
    const v = service.familyView(m.id);
    if (!v.ok) return el('p', { class: 'og-home-empty', 'data-og-family-view': 'denied', text: '이 가족에게는 보이는 화면이 없어요.' });
    const s = v.snapshot;
    const respond = (r, to, okText) => { const out = service.respondHelp(m.id, r.id, to); say(cards.members, out, okText); focusLater('view-title'); renderAll(); changed(); };
    return el('section', { class: 'og-home-form', 'data-og-family-view': m.id, 'aria-label': `${m.displayName}님에게 보이는 화면` },
      el('h4', { class: 'og-life-sub', 'data-og-focus': 'view-title', tabindex: '-1', text: `${m.displayName}님에게 보이는 화면` }),
      el('p', { class: 'og-home-note', text: '내가 허락한 정보만 나와요. 이 기기에서 미리 보는 것이고, 다른 기기의 가족에게는 아직 전달되지 않아요.' }),
      s.items.length ? el('ul', { class: 'og-life-days', 'aria-label': '보이는 정보' }, s.items.map((i) => el('li', { 'data-og-view-item': i.category }, el('span', { class: 'og-life-days__date', text: i.label }), el('span', { class: 'og-life-days__text', text: i.lines.join(' · ') })))) : el('p', { class: 'og-home-empty', 'data-og-view-item': 'none', text: '공유된 정보가 없어요.' }),
      s.requests.length ? el('div', {}, el('p', { class: 'og-field__label', text: '부탁받은 도움' }), el('ul', { class: 'og-home-items', 'aria-label': '부탁받은 도움' }, s.requests.map((r) => el('li', { class: 'og-home-item', 'data-og-view-request': r.id },
        el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: r.kindLabel }), el('p', { class: 'og-home-item__meta', text: HELP_STATE_LABELS[r.status] }), r.message ? el('p', { class: 'og-home-item__text', text: r.message }) : null),
        el('div', { class: 'og-home-item__actions' },
          r.status === 'REQUESTED' ? btn('봤어요', 'ghost og-btn--small', { 'aria-label': `${r.kindLabel} 요청을 봤어요 (가족 역할)` }, () => respond(r, 'SEEN', '가족이 본 것으로 표시했어요.')) : null,
          r.status === 'REQUESTED' || r.status === 'SEEN' ? btn('도울게요', 'ghost og-btn--small', { 'aria-label': `${r.kindLabel} 요청을 돕기로 해요 (가족 역할)` }, () => respond(r, 'ACCEPTED', '가족이 돕기로 한 것으로 표시했어요.')) : null,
          r.status === 'ACCEPTED' ? btn('끝냈어요', 'ghost og-btn--small', { 'aria-label': `${r.kindLabel} 요청을 끝냈어요 (가족 역할)` }, () => respond(r, 'COMPLETED', '끝난 요청으로 표시했어요.')) : null))))) : null);
  }

  function renderMember() {
    const card = cards.members;
    const o = service.overview();
    const m = o.connected.find((x) => x.id === ui.member) || null;
    clear(card.body);
    card.root.hidden = !o.connected.length;
    card.root.dataset.ogState = m ? 'open' : 'closed';
    if (!o.connected.length) return;
    if (!m) {
      ui.member = null;
      put(card.body, el('p', { class: 'og-home-empty', text: '위 ‘연결 상태’에서 가족을 골라 ‘보여줄 정보 정하기’를 눌러 주세요.' }),
        el('p', { class: 'og-home-note', text: '연결만으로는 아무것도 보이지 않아요. 가족마다 따로 정해요.' }));
    } else {
      put(card.body,
        el('h4', { class: 'og-life-sub', 'data-og-focus': 'member-title', tabindex: '-1', text: `${m.displayName} (${who(m)})` }),
        sharingForm(card, m),
        el('div', { class: 'og-form__actions' }, btn(ui.viewing === m.id ? '보이는 화면 닫기' : '이 가족에게 보이는 화면 보기', 'ghost', { 'data-og-focus': 'view-open', 'aria-expanded': ui.viewing === m.id ? 'true' : 'false' }, () => { ui.viewing = ui.viewing === m.id ? null : m.id; focusLater(ui.viewing ? 'view-title' : 'view-open'); renderMember(); })),
        ui.viewing === m.id ? familyViewPanel(m) : null,
        el('h4', { class: 'og-life-sub', text: '공유 중단과 연결 해제' }),
        el('ul', { class: 'og-family-points' }, el('li', { text: '공유 중단: 연결은 그대로 두고, 이 가족에게 보여 주던 정보를 모두 끕니다. 다시 켤 수 있어요.' }), el('li', { text: '연결 해제: 공유를 끄고 이 가족과의 연결도 끊습니다. 다시 연결하려면 새 초대가 필요해요.' })),
        ui.confirm === 'stop'
          ? confirmBox({ key: 'stop', question: `${m.displayName}님에게 보여 주던 정보를 모두 끌까요? 연결은 그대로 있어요.`, yes: '공유 중단', onNo: () => { ui.confirm = null; focusLater('stop'); renderMember(); }, onYes: () => { const r = service.stopSharing(m.id); ui.confirm = null; ui.draft = null; ui.consents = []; if (r.ok) cards.connect.say(''); say(card, r, `${m.displayName}님과의 공유를 모두 멈췄어요. 연결은 그대로예요.`); focusLater('member-title'); renderAll(); changed(); } })
          : ui.confirm === 'disconnect'
            ? confirmBox({ key: 'disconnect', question: `${m.displayName}님과의 연결을 해제할까요? 공유가 모두 꺼지고, 부탁해 둔 도움 요청은 취소돼요.`, yes: '연결 해제', onNo: () => { ui.confirm = null; focusLater('disconnect'); renderMember(); }, onYes: () => { const r = service.disconnect(m.id); ui.confirm = null; ui.member = null; ui.draft = null; ui.viewing = null; say(cards.connect, r, `${m.displayName}님과의 연결을 해제했어요. 더 이상 아무것도 보이지 않아요.`); focusLater('invite-open'); renderAll(); changed(); } })
            : el('div', { class: 'og-form__actions' }, btn('공유 중단', 'ghost', { 'data-og-focus': 'stop', 'data-og-family-stop': m.id, disabled: !m.sharedCount }, () => { ui.confirm = 'stop'; renderMember(); }), btn('연결 해제', 'ghost', { 'data-og-focus': 'disconnect', 'data-og-family-disconnect': m.id }, () => { ui.confirm = 'disconnect'; renderMember(); })));
    }
    if (o.connected.some((x) => x.sharedCount)) {
      put(card.body, ui.confirm === 'stop-all'
        ? confirmBox({ key: 'stop-all', question: '모든 가족에게 보여 주던 정보를 끌까요? 연결은 그대로 있어요.', yes: '전체 공유 중단', onNo: () => { ui.confirm = null; focusLater('stop-all'); renderMember(); }, onYes: () => { const r = service.stopAllSharing(); ui.confirm = null; ui.draft = null; ui.consents = []; if (r.ok) cards.connect.say(''); say(card, r, '모든 가족과의 공유를 멈췄어요.'); focusLater('member-title'); renderAll(); changed(); } })
        : el('div', { class: 'og-form__actions' }, btn('전체 공유 중단', 'text', { 'data-og-focus': 'stop-all', 'data-og-family-stop-all': 'true' }, () => { ui.confirm = 'stop-all'; renderMember(); })));
    }
    applyFocus(card);
  }
  /* ───────── 가족에게 도움 요청 ───────── */

  function renderHelp() {
    const card = cards.help;
    const o = service.overview();
    const list = service.requests();
    clear(card.body);
    card.root.hidden = !o.connected.length && !list.length;
    if (card.root.hidden) return;
    const nameOf = (id) => (o.members.find((m) => m.id === id) || { displayName: '연결 해제한 가족' }).displayName;
    card.root.dataset.ogState = list.length ? 'filled' : 'empty';
    if (!list.length) put(card.body, el('p', { class: 'og-home-empty', 'data-og-family-help': 'empty', text: '부탁한 도움 요청이 없어요.' }));
    else put(card.body, el('ul', { class: 'og-home-items', 'aria-label': '가족에게 부탁한 도움' }, list.map((r) => {
      const open = ['REQUESTED', 'SEEN', 'ACCEPTED'].includes(r.status);
      const asking = ui.helpConfirm === r.id;
      return el('li', { class: asking ? 'og-home-item og-home-item--confirm' : 'og-home-item', 'data-og-family-request': r.id, 'data-og-request-status': r.status },
        el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: `${nameOf(r.memberId)}님에게: ${r.kindLabel}` }), el('p', { class: 'og-home-item__meta', text: `${HELP_STATE_LABELS[r.status]} · ${formatDay(r.updatedAt)}` }), r.message ? el('p', { class: 'og-home-item__text', text: r.message }) : null),
        asking
          ? confirmBox({ key: `help:${r.id}`, question: open ? '이 도움 요청을 취소할까요?' : '이 도움 요청을 목록에서 지울까요?', yes: open ? '요청 취소' : '지우기', onNo: () => { ui.helpConfirm = null; focusLater(`help:${r.id}`); renderHelp(); }, onYes: () => { const out = open ? service.cancelHelp(r.id) : service.removeRequest(r.id); ui.helpConfirm = null; say(card, out, open ? '도움 요청을 취소했어요.' : '도움 요청을 지웠어요.'); focusLater('help-open'); renderAll(); changed(); } })
          : el('div', { class: 'og-home-item__actions' },
              r.status === 'ACCEPTED' ? btn('끝났어요', 'ghost og-btn--small', { 'aria-label': `${r.kindLabel} 요청이 끝났어요` }, () => { const out = service.completeHelp(r.id); say(card, out, '끝난 요청으로 표시했어요.'); focusLater('help-open'); renderAll(); changed(); }) : null,
              btn(open ? '취소' : '지우기', 'ghost og-btn--small', { 'data-og-focus': `help:${r.id}`, 'aria-label': `${r.kindLabel} 요청 ${open ? '취소' : '지우기'}` }, () => { ui.helpConfirm = r.id; renderHelp(); })));
    })));
    const ready = o.connected.filter((m) => service.levels(m.id).HELP_REQUEST === 'DETAIL');
    if (ui.helpForm && ready.length) {
      const to = makeField({ name: 'memberId', label: '누구에게 부탁할까요?', type: 'select', required: true, options: ready.map((m) => ({ id: m.id, label: m.displayName })) }, ready[0].id);
      const kind = makeField({ name: 'kind', label: '어떤 도움이 필요하세요?', type: 'select', required: true, options: FAMILY_HELP_KINDS.map((k) => ({ id: k.id, label: k.label })) }, FAMILY_HELP_KINDS[0].id);
      const message = makeField({ name: 'message', label: '자세한 내용', type: 'textarea', required: false, maxlength: FAMILY_LIMITS.message, hint: `${FAMILY_LIMITS.message}자까지. ‘직접 작성’을 고르면 꼭 적어 주세요.` });
      const errorId = nextId('error');
      const error = el('p', { class: 'og-form-error', role: 'alert', id: errorId });
      const close = () => { ui.helpForm = false; focusLater('help-open'); renderHelp(); };
      const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '가족에게 도움 요청하기', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } } }, to.node, kind.node, message.node, error,
        el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '부탁하기' }), btn('취소', 'ghost', {}, close)));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const r = service.requestHelp({ memberId: to.get(), kind: kind.get(), message: message.get() });
        if (!r.ok) {
          error.textContent = textFor({ INVALID_MESSAGE: '무엇을 부탁하는지 적어 주세요.', LIMIT: '도움 요청이 너무 많아요. 끝난 요청을 지워 주세요.', SHARING_OFF: '이 가족에게는 ‘도움 요청’ 공유가 꺼져 있어요.', STORAGE_UNAVAILABLE: STORAGE_TEXT }, r.reason, '부탁하지 못했어요. 다시 해 주세요.');
          message.input.setAttribute('aria-invalid', 'true');
          message.input.setAttribute('aria-describedby', errorId);
          message.input.focus();
          return;
        }
        ui.helpForm = false;
        card.say('도움 요청을 적어 두었어요. 이 기기의 ‘가족에게 보이는 화면’에만 나타나요.');
        focusLater('help-open');
        renderAll();
        changed();
      });
      put(card.body, form);
      queueMicrotask(() => kind.input.focus());
    } else if (ready.length) {
      put(card.body, el('div', { class: 'og-form__actions' }, btn('도움 부탁하기', 'primary', { 'data-og-focus': 'help-open', 'data-og-family-help-open': 'true' }, () => { ui.helpForm = true; renderHelp(); })));
    } else if (o.connected.length) {
      put(card.body, el('p', { class: 'og-home-note', 'data-og-family-help': 'sharing-off', text: '도움을 부탁하려면 먼저 그 가족의 ‘보여줄 정보’에서 ‘도움 요청’을 켜 주세요.' }));
    }
    put(card.body,
      el('p', { class: 'og-notice', role: 'note', 'data-og-help-delivery': 'LOCAL_IN_APP' }, el('strong', { text: '휴대폰 알림이나 문자는 가지 않아요. ' }), '도움 요청은 ONGIL 안에만 적히고, 지금은 이 기기에서만 볼 수 있어요. 급한 일은 가족에게 직접 연락해 주세요.'),
      el('p', { class: 'og-home-note', text: '도움 요청은 응급 신고가 아니에요. ONGIL은 신고나 출동을 대신하지 않아요. 위급할 때는 119에 직접 전화해 주세요.' }));
    applyFocus(card);
  }

  /* ───────── 활동 기록 ───────── */

  const ACTIVITY_SHOWN = 30;
  function renderActivity() {
    const card = cards.activity;
    const all = service.activity();
    clear(card.body);
    card.root.hidden = !all.length;
    if (!all.length) return;
    const line = (a) => [a.memberName ? `${a.memberName}님` : '', ACTIVITY_ACTIONS[a.action], a.categoryLabel ? `(${a.categoryLabel}${a.level ? `: ${LEVEL_LABELS[a.level]}` : ''})` : '', a.status ? `→ ${HELP_STATE_LABELS[a.status]}` : ''].filter(Boolean).join(' ');
    put(card.body,
      el('ul', { class: 'og-life-days', 'aria-label': '가족 활동 기록' }, all.slice(0, ACTIVITY_SHOWN).map((a) => el('li', { 'data-og-family-activity': a.action }, el('span', { class: 'og-life-days__date', text: formatDay(a.at) }), el('span', { class: 'og-life-days__text', text: line(a) })))),
      el('p', { class: 'og-home-note', text: `최근 ${Math.min(all.length, ACTIVITY_SHOWN)}개예요. 무엇이 바뀌었는지만 남기고, 공유된 내용 자체는 남기지 않아요.` }));
  }

  function renderAll() {
    renderConnect();
    renderMember();
    renderHelp();
    renderActivity();
  }
  function reset() {
    Object.assign(ui, { invite: false, lastCode: null, accept: null, revoke: null, member: null, draft: null, consents: [], confirm: null, viewing: null, helpForm: false, helpConfirm: null, focus: null });
    service.refresh();
    renderAll();
  }
  renderAll();
  return Object.freeze({ render: renderAll, reset, connectedCount: () => service.connectedCount() });
}
