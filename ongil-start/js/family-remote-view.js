/*
 * 계정으로 가족 연결 (Family Connection V2) — one card on the 가족 screen, drawn ONLY when this page has a Newon+ sign-in.
 * Without a sign-in (today's production page: ONGIL does not load Newon+ auth yet) nothing is added and V1 LOCAL is the
 * whole screen. Built from the existing ONGIL parts (card, fields, choices, confirm box, item list): no new look.
 *
 *   signed in, server not ready   says so in one line; V1 LOCAL keeps working; nothing is sent.
 *   signed in, server ready       invite (code shown once), accept a code, per-member sharing on the account, send the
 *                                 current lines, stop / disconnect, help requests, and the families I am a member of.
 *
 * Every answer comes from the server (family-remote.js). This file holds no rule of its own about who may see what, and
 * never says something happened unless the server said so (no "보냈어요" for a code: the owner hands it over in person).
 */
import { el, clear, append } from './dom.js';
import { createCard, makeField } from './home-ui.js';
import { SHARING_CATEGORIES, LEVEL_LABELS, FAMILY_LIMITS, FAMILY_HELP_KINDS, HELP_STATE_LABELS, HELP_TRANSITIONS, MEMBER_ROLES, RELATIONSHIPS, INVITE_EXPIRY } from './family-domain.js';
import { FAMILY_REMOTE_MODES, snapshotItems } from './family-remote.js';
import { formatDay } from './dates.js';

const put = (node, ...kids) => append(node, kids);
const labelOf = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
const AGAIN = '처리하지 못했어요. 잠시 후 다시 해 주세요.';
const textOf = (r) => (r && r.message) || AGAIN;
const MEMBER_MOVES = { SEEN: '봤어요', ACCEPTED: '도울게요', COMPLETED: '끝났어요' };
const OWNER_MOVES = { CANCELLED: '요청 취소', COMPLETED: '끝남으로 표시' };

export const REMOTE_UNAVAILABLE_TEXT = 'Newon+ 계정으로 로그인되어 있지만, 다른 기기의 가족과 연결하는 기능은 아직 열리지 않았어요. 지금은 이 기기 안에서만 연결돼요.';

export function createFamilyRemoteView({ remote, readers, today }) {
  let card = null;
  let grid = null;
  let mode = FAMILY_REMOTE_MODES.ANONYMOUS_LOCAL;
  let data = null;
  const ui = { invite: false, code: null, accept: null, sharing: null, draft: null, help: null, confirm: null, viewing: null, shared: null };
  const btn = (text, cls, attrs, onclick) => el('button', { type: 'button', class: `og-btn og-btn--${cls}`, ...attrs, text, onclick });
  const who = (x) => [labelOf(RELATIONSHIPS, x.relationship), labelOf(MEMBER_ROLES, x.role)].filter(Boolean).join(' · ');
  const confirmBox = (key, question, yes, onYes) => {
    const no = btn('그대로 두기', 'ghost', {}, () => { ui.confirm = null; render(); });
    queueMicrotask(() => no.focus());
    return el('div', { class: 'og-confirm', role: 'group', 'aria-label': '확인', onkeydown: (event) => { if (event.key === 'Escape') { event.preventDefault(); ui.confirm = null; render(); } } }, el('p', { text: question }), el('div', { class: 'og-form__actions' }, no, btn(yes, 'danger', { 'data-og-remote-confirm': key }, onYes)));
  };
  /* run one server call; on success reload what the server holds now and redraw */
  async function act(promise, okText) {
    const r = await promise;
    if (!r.ok) { card.say(textOf(r)); return r; }
    card.say(okText);
    await load();
    keepFocus();
    return r;
  }
  /* a redraw removes the control that was used: focus goes to the card title instead of being lost on the page */
  function keepFocus() {
    const a = typeof document !== 'undefined' ? document.activeElement : null;
    if (card && (!a || a === document.body || !a.isConnected)) card.focusTitle();
  }

  async function load() {
    const r = await remote.overview();
    data = r.ok ? r : null;
    if (!r.ok) card.say('가족 연결 정보를 불러오지 못했어요. 잠시 후 다시 해 주세요.');
    render();
  }

  /* ───────── owner: invite ───────── */
  function inviteForm() {
    const name = makeField({ name: 'displayName', label: '누구를 초대하나요?', type: 'text', required: true, maxlength: FAMILY_LIMITS.name, hint: '내가 부르는 이름을 적어 주세요. 예: 큰딸' });
    const relation = makeField({ name: 'relationship', label: '관계', type: 'select', required: true, options: RELATIONSHIPS }, 'child');
    const role = makeField({ name: 'role', label: '어떤 분인가요?', type: 'select', required: true, options: MEMBER_ROLES, hint: '어느 쪽을 골라도 보이는 정보는 같아요.' }, 'FAMILY');
    const expiry = makeField({ name: 'expiry', label: '초대를 받을 수 있는 기간', type: 'select', required: true, options: INVITE_EXPIRY }, '7d');
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '계정으로 가족 초대 만들기' }, name.node, relation.node, role.node, expiry.node,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '초대 코드 만들기' }), btn('취소', 'ghost', {}, () => { ui.invite = false; render(); })));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = await remote.createInvitation({ displayName: name.get(), relationship: relation.get(), role: role.get(), expiry: expiry.get() });
      if (!r.ok) { card.say(textOf(r)); name.input.focus(); return; }
      ui.invite = false;
      ui.code = { name: r.invitation.displayName, code: r.formattedCode, until: r.invitation.expiresAt };
      card.say('초대 코드를 만들었어요. 가족에게 직접 알려 주세요.');
      await load();
      /* the code is shown once: move focus to it so a screen reader reads it right away */
      const shown = card && card.body.querySelector('.og-family-code');
      if (shown) shown.focus(); else keepFocus();
    });
    queueMicrotask(() => name.input.focus());
    return form;
  }

  /* ───────── owner: sharing for one member (levels on the server; consent asked here, checked there) ───────── */
  function sharingForm(m) {
    /* the unsaved choice lives in ui, so a redraw (the screen refreshing) does not throw it away */
    if (!ui.draft || ui.draft.id !== m.id) ui.draft = { id: m.id, levels: { ...m.levels }, consents: new Set() };
    const draft = ui.draft.levels;
    const consents = ui.draft.consents;
    const fields = SHARING_CATEGORIES.map((c) => {
      const select = el('select', { class: 'og-input', name: `og-remote-share-${c.id}`, 'aria-label': `${c.label} 공유 정도`, onchange: (event) => { draft[c.id] = event.target.value; } }, c.levels.map((l) => el('option', { value: l, text: LEVEL_LABELS[l], selected: draft[c.id] === l })));
      const consent = c.sensitive ? el('label', { class: 'og-choice' }, el('input', { type: 'checkbox', name: `og-remote-consent-${c.id}`, checked: consents.has(c.id), onchange: (event) => { if (event.target.checked) consents.add(c.id); else consents.delete(c.id); } }), el('span', { text: '건강 관련 정보예요. 이 가족에게 보여 주는 데 동의해요.' })) : null;
      return el('div', { class: 'og-field', 'data-og-remote-share': c.id }, el('p', { class: 'og-field__label', text: c.label }), select, consent);
    });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': `${m.displayName}님에게 보여줄 정보` }, fields,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '저장' }), btn('닫기', 'ghost', {}, () => { ui.sharing = null; ui.draft = null; render(); })));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const changed = Object.fromEntries(Object.entries(draft).filter(([k, v]) => m.levels[k] !== v));
      if (!Object.keys(changed).length) { card.say('바뀐 것이 없어요.'); return; }
      const r = await act(remote.setPermissions(m.id, changed, [...consents]), `${m.displayName}님에게 보여줄 정보를 저장했어요. ‘지금 내용 보내기’를 눌러야 새 내용이 보여요.`);
      if (r.ok) { ui.sharing = null; ui.draft = null; render(); }
    });
    return form;
  }
  function publish(m) {
    const items = snapshotItems(readers, m.levels, today());
    return act(remote.publish(m.id, items), items.length ? `${m.displayName}님이 볼 수 있는 내용을 지금 기준으로 보냈어요.` : `${m.displayName}님에게 보여 주는 정보가 없어서 보낼 내용이 없어요.`);
  }
  function helpForm(m) {
    const kind = makeField({ name: 'kind', label: '어떤 도움인가요?', type: 'select', required: true, options: FAMILY_HELP_KINDS }, 'call');
    const message = makeField({ name: 'message', label: '부탁할 내용', type: 'textarea', maxlength: FAMILY_LIMITS.message });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': `${m.displayName}님에게 도움 부탁하기` }, kind.node, message.node,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '부탁하기' }), btn('취소', 'ghost', {}, () => { ui.help = null; render(); })));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = await act(remote.requestHelp(m.id, kind.get(), message.get()), `${m.displayName}님에게 도움을 부탁했어요. 가족이 ONGIL에서 확인하면 상태가 바뀌어요.`);
      if (r.ok) { ui.help = null; render(); }
    });
    return form;
  }
  function ownerMember(m) {
    const shown = SHARING_CATEGORIES.filter((c) => m.levels[c.id] && m.levels[c.id] !== 'NONE').map((c) => `${c.label}(${LEVEL_LABELS[m.levels[c.id]]})`);
    const open = ui.confirm && ui.confirm.id === m.id ? ui.confirm.kind : null;
    return el('li', { class: 'og-home-item', 'data-og-remote-member': m.id },
      el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.displayName }), el('p', { class: 'og-home-item__meta', text: `${who(m)} · ${shown.length ? `보여 주는 것: ${shown.join(', ')}` : '아직 아무것도 보여 주지 않아요'}` })),
      el('div', { class: 'og-home-item__actions' },
        btn('보여줄 정보 정하기', 'ghost og-btn--small', { 'aria-expanded': ui.sharing === m.id ? 'true' : 'false' }, () => { ui.sharing = ui.sharing === m.id ? null : m.id; ui.draft = null; render(); }),
        shown.length ? btn('지금 내용 보내기', 'ghost og-btn--small', {}, () => publish(m)) : null,
        m.levels.HELP_REQUEST === 'DETAIL' ? btn('도움 부탁하기', 'ghost og-btn--small', {}, () => { ui.help = m.id; render(); }) : null,
        shown.length ? btn('공유 멈추기', 'ghost og-btn--small', {}, () => { ui.confirm = { id: m.id, kind: 'stop' }; render(); }) : null,
        btn('연결 해제', 'ghost og-btn--small', {}, () => { ui.confirm = { id: m.id, kind: 'disconnect' }; render(); })),
      ui.sharing === m.id ? sharingForm(m) : null,
      ui.help === m.id ? helpForm(m) : null,
      open === 'stop' ? confirmBox('stop', `${m.displayName}님에게 보여 주던 정보를 모두 끌까요? 연결은 그대로 있어요.`, '공유 멈추기', () => { ui.confirm = null; act(remote.stopSharing(m.id), `${m.displayName}님과의 공유를 멈췄어요. 연결은 그대로예요.`); }) : null,
      open === 'disconnect' ? confirmBox('disconnect', `${m.displayName}님과의 연결을 해제할까요? 해제하면 바로 아무것도 볼 수 없어요.`, '연결 해제', () => { ui.confirm = null; act(remote.disconnect(m.id), `${m.displayName}님과의 연결을 해제했어요.`); }) : null);
  }
  const ownerRequest = (r) => el('li', { class: 'og-home-item', 'data-og-remote-request': r.id },
    el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: r.kindLabel }), el('p', { class: 'og-home-item__meta', text: `${HELP_STATE_LABELS[r.status]}${r.message ? ` · ${r.message}` : ''}` })),
    el('div', { class: 'og-home-item__actions' }, (HELP_TRANSITIONS.OWNER[r.status] || []).map((to) => btn(OWNER_MOVES[to], 'ghost og-btn--small', {}, () => act(remote.moveHelp(r.id, to), `도움 요청을 ‘${HELP_STATE_LABELS[to]}’(으)로 바꿨어요.`)))));

  /* ───────── member: accept a code, see what is shared, answer requests, leave ───────── */
  function acceptForm() {
    const a = ui.accept;
    if (a.invitation) {
      const label = makeField({ name: 'ownerLabel', label: '초대한 분을 어떻게 부를까요?', type: 'text', required: true, maxlength: FAMILY_LIMITS.name, hint: '예: 엄마, 아버지' });
      const yes = btn('연결하기', 'primary', {}, async () => {
        const r = await act(remote.acceptInvitation(a.code, label.get()), '연결했어요. 초대한 분이 보여 주기로 고른 것만 보여요.');
        if (r.ok) { ui.accept = null; render(); }
      });
      const no = btn('받지 않기', 'ghost', {}, async () => { const r = await act(remote.declineInvitation(a.code), '초대를 받지 않았어요.'); if (r.ok) { ui.accept = null; render(); } });
      queueMicrotask(() => label.input.focus());
      return el('div', { class: 'og-confirm', role: 'group', 'aria-label': '초대 확인' },
        el('p', { text: `‘${a.invitation.displayName}’(${who(a.invitation)})(으)로 초대받았어요. ${formatDay(a.invitation.expiresAt)}까지 받을 수 있어요.` }),
        el('ul', { class: 'og-family-points' }, el('li', { text: '연결해도 처음에는 아무것도 보이지 않아요. 초대한 분이 고른 것만 보여요.' }), el('li', { text: '언제든 내가 연결을 끝낼 수 있어요.' })),
        label.node, el('div', { class: 'og-form__actions' }, no, yes, btn('취소', 'ghost', {}, () => { ui.accept = null; render(); })));
    }
    const code = makeField({ name: 'code', label: '초대 코드', type: 'text', required: true, maxlength: 40, hint: '가족에게 받은 글자 20개예요.' });
    const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': '초대 코드로 연결하기' }, code.node,
      el('div', { class: 'og-form__actions' }, el('button', { type: 'submit', class: 'og-btn og-btn--primary', text: '초대 확인하기' }), btn('취소', 'ghost', {}, () => { ui.accept = null; render(); })));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const r = await remote.inspectInvitation(code.get());
      if (!r.ok) { card.say(textOf(r)); code.input.focus(); return; }
      ui.accept = { code: code.get(), invitation: r.invitation };
      card.say('');
      render();
    });
    queueMicrotask(() => code.input.focus());
    return form;
  }
  async function view(memberId) {
    const r = await remote.viewShared(memberId);
    if (!r.ok) { card.say(textOf(r)); ui.viewing = null; ui.shared = null; await load(); return; }
    ui.viewing = memberId;
    ui.shared = r.shared;
    render();
  }
  function sharedPanel(s) {
    return el('div', { class: 'og-home-form', 'data-og-remote-shared': s.memberId },
      s.empty ? el('p', { class: 'og-home-empty', text: `${s.ownerLabel}님이 아직 보여 주는 정보가 없어요.` }) : null,
      s.items.length ? el('ul', { class: 'og-family-points', 'aria-label': `${s.ownerLabel}님이 보여 주는 정보` }, s.items.map((i) => el('li', {}, el('strong', { text: `${i.label} ` }), i.lines.join(' · '), el('span', { class: 'og-home-item__meta', text: ` (${formatDay(i.publishedAt)} 기준)` })))) : null,
      s.requests.length ? el('ul', { class: 'og-home-items', 'aria-label': '나에게 온 도움 요청' }, s.requests.map((r) => el('li', { class: 'og-home-item' },
        el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: r.kindLabel }), el('p', { class: 'og-home-item__meta', text: `${HELP_STATE_LABELS[r.status]}${r.message ? ` · ${r.message}` : ''}` })),
        el('div', { class: 'og-home-item__actions' }, (HELP_TRANSITIONS.MEMBER[r.status] || []).map((to) => btn(MEMBER_MOVES[to], 'ghost og-btn--small', {}, async () => { const x = await act(remote.moveHelp(r.id, to), `‘${HELP_STATE_LABELS[to]}’(으)로 바꿨어요.`); if (x.ok) view(s.memberId); })))))) : null);
  }
  function membership(m) {
    const leaving = ui.confirm && ui.confirm.id === m.memberId && ui.confirm.kind === 'leave';
    return el('li', { class: 'og-home-item', 'data-og-remote-membership': m.memberId },
      el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.ownerLabel }), el('p', { class: 'og-home-item__meta', text: `${who(m)}(으)로 연결됨` })),
      el('div', { class: 'og-home-item__actions' },
        btn(ui.viewing === m.memberId ? '새로 보기' : '보여 주는 정보 보기', 'ghost og-btn--small', {}, () => view(m.memberId)),
        btn('연결 끝내기', 'ghost og-btn--small', {}, () => { ui.confirm = { id: m.memberId, kind: 'leave' }; render(); })),
      ui.viewing === m.memberId && ui.shared ? sharedPanel(ui.shared) : null,
      leaving ? confirmBox('leave', `${m.ownerLabel}님과의 연결을 끝낼까요? 끝내면 바로 아무것도 볼 수 없어요.`, '연결 끝내기', () => { ui.confirm = null; ui.viewing = null; act(remote.leave(m.memberId), `${m.ownerLabel}님과의 연결을 끝냈어요.`); }) : null);
  }

  function render() {
    if (!card) return;
    clear(card.body);
    card.root.dataset.ogState = mode;
    if (mode === FAMILY_REMOTE_MODES.REMOTE_UNAVAILABLE) {
      put(card.body, el('p', { class: 'og-notice', role: 'note', 'data-og-family-scope': 'ACCOUNT_UNAVAILABLE' }, REMOTE_UNAVAILABLE_TEXT));
      return;
    }
    if (!data) { put(card.body, el('p', { class: 'og-home-empty', text: '가족 연결 정보를 불러오는 중이에요.' }), btn('다시 불러오기', 'ghost og-btn--small', {}, () => load())); return; }
    const { owner, memberships } = data;
    const pending = owner.invitations.filter((i) => i.status === 'PENDING');
    put(card.body,
      el('p', { class: 'og-home-note', 'data-og-family-scope': 'ACCOUNT' }, 'Newon+ 계정으로 다른 기기의 가족과 연결돼요. 연결해도 내가 고른 것만, 고른 만큼만 보여요.'),
      el('h4', { class: 'og-life-sub', text: '내가 연결한 가족' }),
      owner.members.length ? el('ul', { class: 'og-home-items', 'aria-label': '계정으로 연결한 가족' }, owner.members.map(ownerMember)) : el('p', { class: 'og-home-empty', text: '아직 계정으로 연결한 가족이 없어요.' }),
      ui.code ? el('p', { class: 'og-family-code', tabindex: '-1', 'aria-label': `${ui.code.name}님 초대 코드 ${ui.code.code.split('').join(' ')}` }, el('span', { class: 'og-home-item__meta', text: `${ui.code.name}님 초대 코드 ` }), el('strong', { text: ui.code.code }), el('span', { class: 'og-home-item__meta', text: ` · ${formatDay(ui.code.until)}까지. 이 화면을 닫으면 코드를 다시 볼 수 없어요.` })) : null,
      pending.length ? el('ul', { class: 'og-home-items', 'aria-label': '기다리는 초대' }, pending.map((i) => el('li', { class: 'og-home-item' },
        el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: `${i.displayName} (${who(i)})` }), el('p', { class: 'og-home-item__meta', text: `초대 대기 중 · ${formatDay(i.expiresAt)}까지` })),
        el('div', { class: 'og-home-item__actions' }, btn('초대 취소', 'ghost og-btn--small', {}, () => act(remote.revokeInvitation(i.id), '초대를 취소했어요. 그 코드로는 연결할 수 없어요.')))))) : null,
      ui.invite ? inviteForm() : el('div', { class: 'og-form__actions' }, btn('계정으로 가족 초대하기', 'primary og-btn--small', {}, () => { ui.invite = true; ui.code = null; render(); })),
      owner.requests.length ? el('h4', { class: 'og-life-sub', text: '가족에게 부탁한 도움' }) : null,
      owner.requests.length ? el('ul', { class: 'og-home-items', 'aria-label': '가족에게 부탁한 도움' }, owner.requests.map(ownerRequest)) : null,
      el('h4', { class: 'og-life-sub', text: '나를 초대한 가족' }),
      memberships.length ? el('ul', { class: 'og-home-items', 'aria-label': '나를 초대한 가족' }, memberships.map(membership)) : el('p', { class: 'og-home-empty', text: '받은 초대로 연결된 가족이 없어요.' }),
      ui.accept ? acceptForm() : el('div', { class: 'og-form__actions' }, btn('받은 초대 코드 넣기', 'ghost og-btn--small', {}, () => { ui.accept = {}; render(); })));
  }

  /* asks the mode again (sign-in may have changed); adds the card only for a signed-in page */
  async function refresh() {
    mode = await remote.resolveMode();
    if (mode === FAMILY_REMOTE_MODES.ANONYMOUS_LOCAL) {
      if (card) { card.root.remove(); card = null; }
      data = null;
      return mode;
    }
    if (!card && grid) {
      card = createCard({ area: 'family', slot: 'account', title: '계정으로 가족 연결', level: 1 });
      grid.prepend(card.root);
    }
    if (mode === FAMILY_REMOTE_MODES.REMOTE_READY) await load();
    else render();
    return mode;
  }
  return Object.freeze({ mount: (node) => { grid = node; return refresh(); }, refresh, mode: () => mode });
}
