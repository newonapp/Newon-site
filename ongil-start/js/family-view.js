/*
 * 가족 (Family V1, Phase 4) — what is true today, and what the user decides for later.
 *
 *   연결 상태            no family is connected (there is no family backend). Said plainly; nothing is simulated.
 *   내가 공유할 내용     the user's own choice per category: 공유 안 함 / 요약만 / 자세히 (only levels that make sense).
 *                        Default is 공유 안 함. Health-adjacent categories ask once more before turning on.
 *   미리 보기            what a family member WOULD see, in words. Never the user's records, never "공유됨".
 *   가족이 보내준 것     empty: nothing can arrive without a connection.
 *   도움 요청            everyday requests written down on this device (not sent), linked to 돌봄·서비스.
 *   약속                 how sharing will work once it exists (consent, revocation, audit).
 *
 * The family screen never shows health records. It only lets the user decide what could be shown later.
 */
import { el, clear, append } from './dom.js';

/* append that skips null/false children (a plain Node.append would print "null") */
const put = (node, ...kids) => append(node, kids);
import { createCard, moreLinks, nextId } from './home-ui.js';
import { createListCard } from './home-list.js';
import { SHARE_CATEGORIES, SHARE_LEVELS, NEVER_SHARED, RELATIONSHIPS, HELP_CATEGORIES, helpCategoryOf, HELP_LIMITS } from './family-contracts.js';
import { buildSharePreview } from './family.js';
import { formatDay } from './dates.js';
import { createFamilyConnectView } from './family-connect-view.js';

const levelLabel = (id) => (SHARE_LEVELS.find((l) => l.id === id) || { label: '' }).label;

/* connect (Family Connection V1): the family service. With it the screen can connect family on this device, decide what
   each member is shown, stop, disconnect, ask for help and show the activity log. Without it the screen is as before. */
/* remote (Family Connection V2): the account card (family-remote-view.js). It draws itself only for a signed-in page;
   without a Newon+ sign-in nothing is added and the screen is exactly V1. */
export function createFamilyView({ host, sharing, help, profile, familyConnection, onChange, connect = null, remote = null }) {
  let cards = null;
  let grid = null;
  let connectView = null;
  let pendingSensitive = null; /* { category, level } waiting for the user's second "yes" */
  let helpList = null;
  const changed = () => typeof onChange === 'function' && onChange();

  /* ───────── 연결 상태 ───────── */

  function renderConnection() {
    if (connectView) return; /* the connection card is drawn by family-connect-view.js */
    const card = cards.connection;
    const state = familyConnection();
    const intent = profile.getProfile().familyIntent;
    clear(card.body);
    card.root.dataset.ogState = 'not-connected';
    put(card.body, 
      el('p', { class: 'og-home-empty', 'data-og-family-status': state.status, text: '아직 연결된 가족이 없어요.' }),
      el('p', { text: '가족 연결 기능은 준비 중이에요. 연결하기 전에는 어떤 내용도 가족에게 가지 않아요.' }),
      intent === 'now' ? el('p', { class: 'og-home-note', 'data-og-family-intent': 'now', text: '처음 설정에서 ‘지금 연결하고 싶어요’를 고르셨어요. 기능이 열리면 이 자리에서 연결할 수 있어요.' }) : null,
      el('h4', { class: 'og-life-sub', text: '연결되면 이렇게 돼요' }),
      el(
        'ul',
        { class: 'og-family-points' },
        el('li', { text: '초대를 보내고, 가족이 받아들여야 연결돼요.' }),
        el('li', { text: `관계(${RELATIONSHIPS.map((r) => r.label).join(', ')})를 고를 수 있어요. 관계에 따라 공유가 저절로 정해지지 않아요.` }),
        el('li', { text: '내가 고른 내용만, 고른 만큼만 보여요. 언제든 끌 수 있어요.' })
      )
    );
  }

  /* ───────── 내가 공유할 내용 ───────── */

  function renderSharing(focusName) {
    const card = cards.sharing;
    const levels = sharing.levels();
    clear(card.body);
    card.root.dataset.ogState = sharing.count() ? 'chosen' : 'none';
    for (const c of SHARE_CATEGORIES) {
      const name = `og-share-${c.id}`;
      const legendId = nextId('legend');
      const waiting = pendingSensitive && pendingSensitive.category === c.id;
      const fs = el(
        'fieldset',
        { class: 'og-choices og-share', 'data-og-share': c.id, 'aria-describedby': `${legendId}-now` },
        el('legend', { class: 'og-field__label', id: legendId }, c.label, c.sensitive ? el('span', { class: 'og-field__optional', text: ' (건강 관련)' }) : null),
        el('p', { class: 'og-field__hint', id: `${legendId}-now`, text: `지금: ${levelLabel(levels[c.id])}` }),
        el(
          'div',
          { class: 'og-choices__list' },
          c.levels.map((level) => {
            const input = el('input', {
              type: 'radio',
              name,
              value: level,
              checked: (waiting ? pendingSensitive.level : levels[c.id]) === level,
              onchange: () => pick(c, level),
            });
            input.dataset.ogShareLevel = `${c.id}:${level}`;
            return el('label', { class: 'og-choice og-share__opt' }, input, el('span', { text: level === 'NONE' ? '공유 안 함' : `${levelLabel(level)} — ${c.words[level]}` }));
          })
        )
      );
      if (waiting) {
        const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-share-cancel': c.id, text: '그대로 두기', onclick: () => { pendingSensitive = null; renderSharing(`${c.id}:${levels[c.id]}`); card.say(`${c.label}은(는) 바꾸지 않았습니다.`); } });
        fs.append(
          el(
            'div',
            { class: 'og-confirm', role: 'group', 'aria-label': `${c.label} 공유 확인` },
            el('p', { text: `${c.label}은(는) 건강과 관련된 내용이에요. 가족이 연결되면 ‘${c.words[pendingSensitive.level]}’을(를) 볼 수 있게 할까요?` }),
            el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--primary', 'data-og-share-confirm': c.id, text: '네, 그렇게 할게요', onclick: () => { const p = pendingSensitive; pendingSensitive = null; apply(c, p.level); } }))
          )
        );
        queueMicrotask(() => cancel.focus());
      }
      put(card.body, fs);
    }
    put(card.body, 
      el('p', { class: 'og-home-note', text: `${NEVER_SHARED.join(', ')}은(는) 공유할 수 없어요.` }),
      sharing.count() ? el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--text', 'data-og-share-reset': 'true', text: '모두 공유 안 함으로 되돌리기', onclick: () => { sharing.reset(); card.say('모든 항목을 공유 안 함으로 되돌렸습니다.'); renderSharing(); renderPreview(); changed(); card.focusTitle(); } })) : null
    );
    if (focusName) {
      const target = card.body.querySelector(`[data-og-share-level="${focusName}"]`);
      if (target) target.focus();
    }
  }

  function pick(c, level) {
    const current = sharing.levels()[c.id];
    if (c.sensitive && level !== 'NONE' && current === 'NONE') {
      pendingSensitive = { category: c.id, level };
      renderSharing();
      return;
    }
    pendingSensitive = null;
    apply(c, level);
  }

  function apply(c, level) {
    const r = sharing.set(c.id, level);
    cards.sharing.say(r.ok ? `${c.label}: ‘${levelLabel(level)}’(으)로 정했습니다. 연결된 가족이 없어 지금은 아무에게도 보이지 않아요.` : '저장하지 못했습니다.');
    renderSharing(`${c.id}:${level}`);
    renderPreview();
    changed();
  }

  /* ───────── 미리 보기 ───────── */

  function renderPreview() {
    const card = cards.preview;
    const p = buildSharePreview(sharing.levels());
    clear(card.body);
    card.root.dataset.ogState = p.empty ? 'empty' : 'filled';
    if (p.empty) {
      put(card.body, el('p', { class: 'og-home-empty', 'data-og-preview-empty': 'true', text: '지금은 공유하도록 고른 내용이 없어요.' }));
    } else {
      put(card.body, el('ul', { class: 'og-life-days', 'aria-label': '가족에게 보일 수 있는 내용' }, p.items.map((i) => el('li', { 'data-og-preview': i.id }, el('span', { class: 'og-life-days__date', text: i.label }), el('span', { class: 'og-life-days__text', text: i.text })))));
    }
    put(card.body, el('p', { class: 'og-notice', role: 'note', 'data-og-preview-state': 'not-shared' }, el('strong', { text: '아직 아무에게도 공유되지 않았어요. ' }), '가족 연결 후 선택한 항목만 공유할 수 있어요.'));
  }

  /* ───────── 가족이 보내준 것 ───────── */

  function renderReceived() {
    const card = cards.received;
    clear(card.body);
    card.root.dataset.ogState = 'empty';
    put(card.body, el('p', { class: 'og-home-empty', 'data-og-received': 'empty', text: '아직 받은 것이 없어요.' }), el('p', { class: 'og-home-note', text: '가족 연결 기능이 열리면 가족이 보낸 프로그램, 장소, 서비스, 상품, 일정이 여기에 모여요.' }));
  }

  /* ───────── 도움 요청 ───────── */

  function buildHelp() {
    const errors = { INVALID_CATEGORY: '어떤 도움인지 골라 주세요.', LIMIT: '적어 둔 도움 요청이 너무 많아요. 해결된 것을 지워 주세요.' };
    helpList = createListCard({
      card: cards.help,
      config: {
        itemName: '도움 요청',
        listLabel: '적어 둔 도움 요청',
        emptyText: '적어 둔 도움 요청이 없어요.',
        addLabel: '도움 요청 적기',
        doneWord: '해결됐어요',
        checkWord: '해결된 요청으로 표시',
        fields: [
          { name: 'category', label: '어떤 도움이 필요하세요?', type: 'select', required: true, options: HELP_CATEGORIES.map((c) => ({ id: c.id, label: c.label })), errors: ['INVALID_CATEGORY', 'LIMIT'] },
          { name: 'message', label: '자세한 내용', type: 'textarea', required: false, maxlength: HELP_LIMITS.message, hint: `${HELP_LIMITS.message}자까지. 예: 다음 주 화요일 오전 병원에 같이 가 주세요.` },
        ],
        getItems: () => help.list(),
        isDone: (item) => item.status === 'resolved',
        describe: (item) => ({ title: (helpCategoryOf(item.category) || { label: '도움 요청' }).label, meta: ['보내지 않음 · 이 기기에만 있어요', `적은 날 ${formatDay(item.createdAt)}`], text: item.message }),
        toggleText: (item, checked) => (checked ? '해결된 요청으로 표시했습니다.' : '해결 표시를 풀었습니다.'),
        onToggle: (item, checked) => help.setResolved(item.id, checked),
        onAdd: (values) => help.add(values),
        onUpdate: (id, values) => help.update(id, values),
        onRemove: (id) => help.remove(id),
        afterChange: changed,
        after: () => {
          const linked = HELP_CATEGORIES.filter((c) => c.careCategory && help.list().some((r) => r.category === c.id && r.status === 'draft'));
          return el(
            'div',
            { class: 'og-home-after' },
            linked.length ? moreLinks(linked.map((c) => ({ label: `${c.label} 정보 돌봄·서비스에서 보기`, href: `#care/${c.careCategory}` }))) : null,
            el('p', { class: 'og-notice', role: 'note', 'data-og-help-state': 'not-sent' }, el('strong', { text: '도움 요청은 아직 가족에게 보내지지 않아요. ' }), '가족 연결 기능이 열리면 보낼 수 있어요. 지금은 가까운 사람에게 직접 연락해 주세요.'),
            el('p', { class: 'og-home-note', text: '도움 요청은 응급 신고가 아니에요. ONGIL은 신고나 출동을 대신하지 않아요. 위급할 때는 119에 직접 전화해 주세요.' })
          );
        },
        errorText: (reason) => errors[reason] || '저장하지 못했습니다. 다시 시도해 주세요.',
      },
    });
    helpList.render();
  }

  /* ───────── 약속 ───────── */

  function renderPromise() {
    const card = cards.promise;
    clear(card.body);
    put(card.body, 
      el(
        'ul',
        { class: 'og-family-points' },
        el('li', { text: '기본은 공유 안 함이에요. 가족과 연결만 해서는 아무것도 보이지 않아요.' }),
        /* with the family service these two are what the screen does today; without it they stay promises */
        connect ? el('li', { text: '보여줄 정보는 가족마다, 항목마다 따로 골라요. 건강·비상 정보는 한 번 더 동의를 받아요.' }) : el('li', { text: '공유를 켤 때는 가족마다, 항목마다 한 번 더 확인하도록 만들 거예요.' }),
        connect ? el('li', { text: '언제든 공유를 멈추거나 연결을 해제할 수 있어요. 그 뒤로는 그 가족에게 보이지 않아요.' }) : el('li', { text: '고른 내용은 지금도 언제든 끌 수 있어요. 연결한 뒤에는 끄면 바로 보이지 않게 만들 거예요.' }),
        connect ? el('li', { text: '연결과 공유를 바꾼 일은 ‘가족 활동 기록’에 남아요. 가족이 언제 봤는지는 계정 연결이 열리면 남길 수 있어요.' }) : el('li', { text: '가족이 무엇을 언제 봤는지 내가 확인할 수 있게 만들 거예요.' }),
        el('li', { text: '건강 메모, 증상 내용, 일기, 생활비는 공유 대상이 아니에요.' })
      )
    );
  }

  function build() {
    clear(host);
    cards = {
      connection: createCard({ area: 'family', slot: 'connect', title: '연결 상태', level: 1 }),
      ...(connect ? { members: createCard({ area: 'family', slot: 'members', title: '이 가족에게 보여줄 정보', level: 1, lead: '가족마다 따로 정해요. 기본은 모두 공유 안 함이에요.' }) } : {}),
      sharing: createCard({ area: 'family', slot: 'sharing', title: '내가 공유할 내용', level: 1, lead: '가족이 연결되면 무엇을 얼마나 보여 줄지 미리 정해 두세요. 기본은 공유 안 함이에요.' }),
      preview: createCard({ area: 'family', slot: 'preview', title: '가족에게 보일 내용 미리 보기', level: 2 }),
      ...(connect ? { familyHelp: createCard({ area: 'family', slot: 'family-help', title: '가족에게 도움 요청', level: 2, lead: '연결한 가족에게 부탁할 일을 남겨요.' }) } : {}),
      help: createCard({ area: 'family', slot: 'requests', title: '도움 요청', level: 2, lead: '가족에게 부탁하고 싶은 일을 적어 두세요.' }),
      received: createCard({ area: 'family', slot: 'received', title: '가족이 보내준 것', level: 3 }),
      ...(connect ? { activity: createCard({ area: 'family', slot: 'activity', title: '가족 활동 기록', level: 3 }) } : {}),
      promise: createCard({ area: 'family', slot: 'promise', title: '가족 공유 약속', level: 3 }),
    };
    host.append(
      el(
        'div',
        { class: 'og-wrap og-family' },
        el('p', { class: 'og-label', lang: 'en', text: 'FAMILY' }),
        el('h2', { class: 'og-h', id: 'og-family-section-title', tabindex: '-1', text: '가족' }),
        el('p', { class: 'og-lead', text: '내가 고른 것만, 내가 정한 만큼만 가족과 나누는 곳입니다.' }),
        grid = el('div', { class: 'og-family-grid' }, Object.values(cards).map((c) => c.root))
      )
    );
    if (remote) remote.mount(grid);
    if (connect) connectView = createFamilyConnectView({ service: connect, cards: { connect: cards.connection, members: cards.members, help: cards.familyHelp, activity: cards.activity }, onChange: () => { syncLegacy(); changed(); } });
    renderConnection();
    renderSharing();
    renderPreview();
    buildHelp();
    renderReceived();
    renderPromise();
    syncLegacy();
    host.dataset.ogRendered = 'true';
  }

  /* "내가 공유할 내용" is what the user would share BEFORE anyone is connected. Once a family member is connected,
     sharing is decided per member, so the two earlier cards step aside (their stored choice is kept, and never applied
     to a member automatically). */
  function syncLegacy() {
    const connected = connectView ? connectView.connectedCount() > 0 : false;
    cards.sharing.root.hidden = connected;
    cards.preview.root.hidden = connected;
  }

  function refresh() {
    pendingSensitive = null;
    for (const c of Object.values(cards)) c.status.textContent = '';
    if (connectView) connectView.reset();
    syncLegacy();
    renderConnection();
    renderSharing();
    renderPreview();
    helpList.reset();
    if (remote) remote.refresh();
  }

  build();
  return Object.freeze({ refresh, openHelp: () => helpList.openAdd() });
}
