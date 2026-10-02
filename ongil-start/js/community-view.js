/*
 * 커뮤니티 (Community + Groups V1, Phase 6) — a local-first foundation, said plainly.
 *
 *   내 글            the user's own posts: write, edit, delete, search, filter, save. Kept on this device only;
 *                    nobody else sees them. There is no feed of other people, because there are no other people yet.
 *   자세히           one <dialog>: the whole post, its local state, 저장 / 고치기 / 지우기.
 *   모임 준비        group drafts (모임 초안) and meetup drafts inside them, each meetup can go into 내 일정.
 *   공개 모임 찾기   empty: there is no public group directory yet.
 *   함께 지킬 것     a short note on privacy (no address, phone, ID number or health detail).
 *
 * No other author, comment, reply, reaction, follower, view count, ranking or notification exists here.
 * 댓글 · 공감 · 신고 · 차단 need a community server with moderation; the screen says so once.
 */
import { el, clear, append } from './dom.js';
import { createCard, choiceButton, makeField, nextId } from './home-ui.js';
import { formatDateKey, formatTime, dateKey } from './dates.js';
import { formatDate } from './dom.js';
import { POST_TYPES, POST_CATEGORIES, GROUP_CATEGORIES, MEETING_STYLES, COMMUNITY_LIMITS, filterPosts, summaryOf, privacyCheck, meetupCalendarDraft, isMeetupInCalendar } from './community-contracts.js';
import { REGIONS } from './contracts.js';

/* append that skips null/false children (a plain Node.append would print "null") */
const put = (node, ...kids) => append(node, kids);
const labelOf = (list, id) => (list.find((o) => o.id === id) || { label: '' }).label;
export const COMMUNITY_SECTIONS = Object.freeze(['write', 'groups']);
export const resolveCommunitySection = (name) => (COMMUNITY_SECTIONS.includes(name) ? name : '');
export const POST_PAGE = 20;
const ERRORS = {
  INVALID_TYPE: '글의 종류를 골라 주세요.',
  INVALID_CATEGORY: '분류를 골라 주세요.',
  INVALID_TITLE: '제목을 적어 주세요.',
  INVALID_BODY: '내용을 적어 주세요.',
  INVALID_NAME: '모임 이름을 적어 주세요.',
  INVALID_STYLE: '만나는 방식을 골라 주세요.',
  INVALID_DATE: '날짜를 골라 주세요.',
  INVALID_TIME: '시간을 다시 골라 주세요.',
  SENSITIVE_NUMBER: '주민등록번호처럼 보이는 숫자가 있어 저장하지 않았어요. 그 숫자를 지워 주세요.',
  LIMIT: '더 저장할 수 없어요. 지난 것을 지워 주세요.',
  STORAGE_FULL: '이 기기의 저장 공간이 부족해요. 오래된 글을 지우거나 내용을 줄여 주세요.',
};
const errorText = (reason) => ERRORS[reason] || '저장하지 못했어요. 다시 시도해 주세요.';
const FIELD_OF = { INVALID_TYPE: 'type', INVALID_CATEGORY: 'category', INVALID_TITLE: 'title', INVALID_BODY: 'body', SENSITIVE_NUMBER: 'body', INVALID_NAME: 'name', INVALID_STYLE: 'meetingStyle', INVALID_DATE: 'date', INVALID_TIME: 'time' };
const LOCAL_NOTE = '지금은 이 기기에만 저장돼요. 다른 사람에게 보이지 않아요.';
const PRIVACY_HINT = '주소, 전화번호, 주민등록번호, 자세한 건강 정보는 적지 마세요.';

/* a form built from field specs, with one error line and focus on the field that needs fixing */
function buildForm({ label, fields, values = {}, submits, onSubmit, onCancel }) {
  const made = fields.map((f) => ({ spec: f, ...makeField(f, values[f.name]) }));
  const error = el('p', { class: 'og-form-error', role: 'alert' });
  const buttons = submits.map((s) => el('button', { type: s.primary ? 'submit' : 'button', class: s.primary ? 'og-btn og-btn--primary' : 'og-btn og-btn--ghost', 'data-og-submit': s.id, text: s.label, onclick: s.primary ? null : () => go(s.id) }));
  const form = el('form', { class: 'og-form og-home-form', novalidate: true, 'aria-label': label }, made.map((f) => f.node), error, el('div', { class: 'og-form__actions' }, buttons, onCancel ? el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-submit': 'cancel', text: '취소', onclick: onCancel }) : null));
  function go(id) {
    const v = Object.fromEntries(made.map((f) => [f.spec.name, f.get()]));
    for (const f of made) f.input.removeAttribute('aria-invalid');
    error.textContent = '';
    const r = onSubmit(id, v);
    if (r && !r.ok) {
      const bad = made.find((f) => f.spec.name === FIELD_OF[r.reason]) || made[0];
      bad.input.setAttribute('aria-invalid', 'true');
      error.textContent = errorText(r.reason);
      bad.input.focus();
    }
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    go(submits.find((s) => s.primary).id);
  });
  return { form, first: made[0].input };
}

export function createCommunityView({ host, doc, posts, groups, meetups, saved, schedule, now = () => Date.now() }) {
  const state = { type: '', category: '', query: '', shown: POST_PAGE, compose: null, groupId: '', groupMode: 'list', groupEdit: false, meetupEdit: '', meetupCalendar: '' };
  let cards = null;
  let dialog = null;
  let opener = null;

  /* ───────── 내 글 ───────── */

  function postForm() {
    const editing = state.compose && state.compose.id ? posts.get(state.compose.id) : null;
    const values = editing || state.compose.values || {};
    const source = editing ? editing.source : state.compose.values && state.compose.values.source;
    const { form, first } = buildForm({
      label: editing ? '글 고치기' : '글쓰기',
      fields: [
        { name: 'type', label: '어떤 글인가요?', type: 'select', required: true, options: POST_TYPES },
        { name: 'category', label: '분류', type: 'select', required: true, options: POST_CATEGORIES },
        { name: 'title', label: '제목', type: 'text', required: true, maxlength: COMMUNITY_LIMITS.postTitle, hint: `${COMMUNITY_LIMITS.postTitle}자까지` },
        { name: 'body', label: '내용', type: 'textarea', required: true, maxlength: COMMUNITY_LIMITS.postBody, hint: `${COMMUNITY_LIMITS.postBody.toLocaleString('ko-KR')}자까지. ${PRIVACY_HINT}` },
      ],
      values,
      submits: [{ id: 'LOCAL', label: '저장', primary: true }, { id: 'DRAFT', label: '임시 저장' }],
      onSubmit: (status, v) => {
        const input = { ...v, status, source };
        const r = editing ? posts.update(editing.id, input) : posts.add(input);
        if (!r.ok) return r;
        const warn = r.check && (r.check.phone || r.check.address) ? ' 전화번호나 자세한 주소처럼 보이는 내용이 있어요. 나중에 공개할 수 있게 되면 꼭 지워 주세요.' : '';
        state.compose = null;
        renderPosts();
        cards.posts.say(`${status === 'DRAFT' ? '임시 저장했어요' : '이 기기에 저장했어요'}. 다른 사람에게는 보이지 않아요.${warn}`);
        const row = cards.posts.body.querySelector(`[data-og-post-open="${r.post.id}"]`);
        if (row) row.focus();
        return r;
      },
      onCancel: () => {
        state.compose = null;
        renderPosts();
        const back = cards.posts.body.querySelector('[data-og-post-write]');
        if (back) back.focus();
      },
    });
    form.dataset.ogPostForm = editing ? 'edit' : 'new';
    const box = el('div', { class: 'og-community-compose' }, source ? el('p', { class: 'og-home-note', 'data-og-post-source': source.sourceId, text: `‘${source.sourceTitle}’에 대한 후기예요 (즐길거리에서 시작). 소개 글은 옮겨 오지 않았어요.` }) : null, form);
    queueMicrotask(() => first.focus());
    return box;
  }

  function filters(list) {
    const types = POST_TYPES.filter((t) => list.some((p) => p.type === t.id));
    const cats = POST_CATEGORIES.filter((c) => list.some((p) => p.category === c.id));
    if (state.type && !types.some((t) => t.id === state.type)) state.type = '';
    if (state.category && !cats.some((c) => c.id === state.category)) state.category = '';
    const typeId = nextId('q');
    const typeGroup = el(
      'div',
      { class: 'og-health-q' },
      el('h4', { class: 'og-life-sub', id: typeId, text: '종류' }),
      el(
        'div',
        { class: 'og-picks', role: 'group', 'aria-labelledby': typeId },
        [{ id: '', label: '전체' }, ...POST_TYPES].map((t) => {
          const b = choiceButton({ label: t.label, pressed: state.type === t.id, onChoose: () => { state.type = t.id; state.shown = POST_PAGE; renderPosts(`[data-og-post-type="${t.id || 'all'}"]`); } });
          b.dataset.ogPostType = t.id || 'all';
          if (t.id && !types.some((x) => x.id === t.id)) {
            b.disabled = true;
            b.setAttribute('aria-disabled', 'true');
          }
          return b;
        })
      )
    );
    const cat = makeField({ name: 'category', label: '분류로 좁히기', type: 'select', required: false, options: cats, emptyLabel: '모든 분류' }, state.category);
    cat.input.dataset.ogPostCategory = 'filter';
    cat.input.addEventListener('change', () => { state.category = cat.get(); state.shown = POST_PAGE; renderPosts('[data-og-post-category="filter"]'); });
    const search = makeField({ name: 'q', label: '내 글에서 찾기', type: 'search', required: false, maxlength: 60, hint: '제목, 내용, 종류, 분류로 찾아요.' }, state.query);
    search.input.dataset.ogPostSearch = 'q';
    search.input.addEventListener('input', () => {
      state.query = search.get();
      state.shown = POST_PAGE;
      const next = filterPosts(posts.list(), state);
      cards.posts.body.querySelector('[data-og-post-list]').replaceWith(postList(next));
      const count = cards.posts.body.querySelector('[data-og-post-count]');
      count.textContent = `${next.length}개`;
      count.dataset.ogPostCount = String(next.length);
    });
    return [typeGroup, cats.length > 1 ? cat.node : null, search.node];
  }

  function postList(list) {
    const wrap = el('div', { 'data-og-post-list': list.length ? 'list' : 'empty' });
    if (!list.length) {
      wrap.append(el('p', { class: 'og-home-empty', text: '조건에 맞는 글이 없어요.' }));
      return wrap;
    }
    const page = list.slice(0, state.shown);
    wrap.append(
      el(
        'ul',
        { class: 'og-home-items', 'aria-label': '내 글 목록' },
        page.map((p) => {
          const isSaved = saved.isSaved('POST', p.id);
          return el(
            'li',
            { class: 'og-home-item', 'data-og-post': p.id },
            el(
              'div',
              { class: 'og-home-item__main og-home-item__main--plain' },
              el('p', { class: 'og-home-item__title', text: p.title }),
              el('p', { class: 'og-home-item__meta', text: [labelOf(POST_TYPES, p.type), labelOf(POST_CATEGORIES, p.category), formatDate(p.updatedAt), p.status === 'DRAFT' ? '임시 저장' : '', isSaved ? '저장함' : ''].filter(Boolean).join(' · ') }),
              el('p', { class: 'og-home-item__text', text: summaryOf(p.body) })
            ),
            el('div', { class: 'og-home-item__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-post-open': p.id, 'aria-haspopup': 'dialog', 'aria-label': `‘${p.title}’ 자세히 보기`, text: '자세히', onclick: (event) => openPost(p.id, event.currentTarget) }))
          );
        })
      )
    );
    if (list.length > page.length) {
      wrap.append(el('div', { class: 'og-form__actions' }, el('button', {
        type: 'button',
        class: 'og-btn og-btn--ghost',
        'data-og-post-more': 'true',
        text: `더 보기 (${list.length - page.length}개 남음)`,
        onclick: () => {
          const first = state.shown;
          state.shown += POST_PAGE;
          const next = postList(list);
          wrap.replaceWith(next);
          const row = next.querySelectorAll('[data-og-post-open]')[first];
          if (row) row.focus();
        },
      })));
    }
    return wrap;
  }

  function renderPosts(focusSelector) {
    const card = cards.posts;
    const all = posts.list();
    clear(card.body);
    card.root.dataset.ogState = all.length ? 'filled' : 'empty';
    const drafts = all.filter((p) => p.status === 'DRAFT').length;
    const savedCount = saved.list({ type: 'POST' }).filter((s) => all.some((p) => p.id === s.id)).length;
    put(card.body, el('p', { class: 'og-notice og-community-local', role: 'note', 'data-og-community-mode': 'local' }, el('strong', { text: LOCAL_NOTE }), ' 커뮤니티 서버가 생기면 내가 고른 글만 공개할 수 있게 만들 예정이에요.'));
    if (state.compose) {
      put(card.body, postForm());
      return;
    }
    put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--primary', 'data-og-post-write': 'true', text: '글쓰기', onclick: () => openCompose({}) })));
    if (!all.length) {
      put(card.body, el('p', { class: 'og-home-empty', 'data-og-community-empty': 'posts', text: '아직 쓴 글이 없어요.' }), el('p', { class: 'og-home-note', text: '궁금한 것, 해 본 경험, 알게 된 정보를 적어 두세요. 다른 사람의 글은 아직 볼 수 없어요.' }));
      return;
    }
    const list = filterPosts(all, state);
    put(
      card.body,
      el('p', { class: 'og-home-note', 'data-og-community-facts': `${all.length}:${drafts}:${savedCount}`, text: `내 글 ${all.length}개${drafts ? ` (임시 저장 ${drafts}개)` : ''}${savedCount ? ` · 저장한 글 ${savedCount}개` : ''}` }),
      filters(all),
      el('p', { class: 'og-life-value', 'data-og-post-count': String(list.length), 'aria-live': 'polite', text: `${list.length}개` }),
      postList(list)
    );
    if (focusSelector) {
      const t = card.body.querySelector(focusSelector);
      if (t && !t.disabled) t.focus();
    }
  }

  function openCompose(values, id = null) {
    state.compose = { id, values };
    renderPosts();
    cards.posts.root.scrollIntoView({ block: 'start' });
  }

  /* ───────── 자세히 (one dialog) ───────── */

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'og-dialog og-care-dialog og-community-dialog', id: 'og-post-detail', 'aria-labelledby': 'og-post-detail-title' });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, #og-post-detail-title')].filter((n) => n.getClientRects().length);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.addEventListener('close', () => {
      clear(dialog);
      const key = opener && opener.dataset ? opener.dataset.ogPostOpen : '';
      const back = opener && opener.isConnected ? opener : key ? host.querySelector(`[data-og-post-open="${key}"]`) : null;
      if (back && !state.compose) back.focus();
      opener = null;
    });
    doc.body.append(dialog);
    return dialog;
  }

  function openPost(id, from, confirm = false) {
    const post = posts.get(id);
    if (!post) return;
    const d = ensureDialog();
    if (from) opener = from;
    clear(d);
    const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });
    const body = el('div', { class: 'og-dialog__body' });
    const isSaved = saved.isSaved('POST', post.id);
    put(
      body,
      el('p', { class: 'og-dialog__progress', text: `${labelOf(POST_TYPES, post.type)} · ${labelOf(POST_CATEGORIES, post.category)}` }),
      el('h2', { class: 'og-dialog__title', id: 'og-post-detail-title', tabindex: '-1', text: post.title }),
      el('p', { class: 'og-home-note', 'data-og-post-state': post.status, text: `${post.status === 'DRAFT' ? '임시 저장한 글' : '이 기기에 저장한 글'} · 다른 사람에게 보이지 않아요 · 쓴 날 ${formatDate(post.createdAt)}${post.updatedAt !== post.createdAt ? ` · 고친 날 ${formatDate(post.updatedAt)}` : ''}` }),
      post.source ? el('p', { class: 'og-home-note', text: `‘${post.source.sourceTitle}’에 대한 후기 (즐길거리)` }) : null,
      el('p', { class: 'og-community-body', 'data-og-post-body': 'true', text: post.body })
    );
    if (confirm) {
      const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => openPost(id, null) });
      put(body, el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인' }, el('p', { text: `‘${post.title}’을(를) 지울까요? 되돌릴 수 없어요.` }), el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--danger', 'data-og-post-delete-confirm': 'true', text: '지우기', onclick: () => {
        posts.remove(id);
        if (saved.isSaved('POST', id)) saved.unsave('POST', id);
        d.close();
        renderPosts();
        cards.posts.say(`‘${post.title}’을(를) 지웠어요.`);
        cards.posts.focusTitle();
      } }))));
      queueMicrotask(() => cancel.focus());
    } else {
      const saveBtn = el('button', {
        type: 'button',
        class: 'og-btn og-btn--primary',
        'data-og-post-save': 'true',
        'aria-pressed': isSaved ? 'true' : 'false',
        text: isSaved ? '✓ 저장함 (누르면 취소)' : '저장',
        onclick: () => {
          const r = saved.toggle({ type: 'POST', id: post.id, title: post.title, description: `내 글 · ${labelOf(POST_TYPES, post.type)} · 이 기기에만 있어요`, href: '#community' });
          status.textContent = r.ok ? (r.saved ? '저장했어요. ‘저장’ 화면에서 다시 볼 수 있어요. 공개되는 것은 아니에요.' : '저장을 취소했어요.') : '저장하지 못했어요.';
          saveBtn.setAttribute('aria-pressed', r.saved ? 'true' : 'false');
          saveBtn.textContent = r.saved ? '✓ 저장함 (누르면 취소)' : '저장';
          renderPosts();
        },
      });
      put(
        body,
        el('div', { class: 'og-dialog__actions' }, saveBtn, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-post-edit': 'true', text: '고치기', onclick: () => { d.close(); openCompose({}, id); } }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-post-delete': 'true', text: '지우기', onclick: () => openPost(id, null, true) }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-post-close': 'true', text: '닫기', onclick: () => d.close() })),
        el('p', { class: 'og-home-note', 'data-og-community-future': 'true', text: '댓글, 공감, 신고는 커뮤니티 서버와 운영 정책이 생기면 쓸 수 있어요.' })
      );
    }
    put(body, status);
    d.append(body);
    if (!d.open && typeof d.showModal === 'function') d.showModal();
    if (!confirm) d.querySelector('#og-post-detail-title').focus();
  }

  /* ───────── 모임 준비 ───────── */

  function groupFields() {
    return [
      { name: 'name', label: '모임 이름', type: 'text', required: true, maxlength: COMMUNITY_LIMITS.groupName, hint: `${COMMUNITY_LIMITS.groupName}자까지` },
      { name: 'category', label: '어떤 모임인가요?', type: 'select', required: true, options: GROUP_CATEGORIES },
      { name: 'meetingStyle', label: '만나는 방식', type: 'select', required: true, options: MEETING_STYLES },
      { name: 'region', label: '지역', type: 'select', required: false, options: REGIONS, emptyLabel: '정하지 않음' },
      { name: 'description', label: '소개', type: 'textarea', required: false, maxlength: COMMUNITY_LIMITS.groupDescription, hint: `${COMMUNITY_LIMITS.groupDescription.toLocaleString('ko-KR')}자까지. ${PRIVACY_HINT}` },
    ];
  }

  function renderGroups(focusSelector) {
    const card = cards.groups;
    clear(card.body);
    const list = groups.list();
    card.root.dataset.ogState = list.length ? 'filled' : 'empty';
    const group = state.groupId ? groups.get(state.groupId) : null;
    if (state.groupId && !group) state.groupId = '';
    if (group) {
      renderGroupDetail(group);
    } else if (state.groupMode === 'new') {
      const { form, first } = buildForm({
        label: '모임 초안 만들기',
        fields: groupFields(),
        submits: [{ id: 'save', label: '모임 초안 저장', primary: true }],
        onSubmit: (_, v) => {
          const r = groups.add(v);
          if (!r.ok) return r;
          state.groupMode = 'list';
          state.groupId = r.group.id;
          renderGroups();
          card.say('모임 초안을 저장했어요. 아직 다른 사람에게 보이지 않아요.');
          return r;
        },
        onCancel: () => { state.groupMode = 'list'; renderGroups('[data-og-group-new]'); },
      });
      form.dataset.ogGroupForm = 'new';
      put(card.body, form);
      queueMicrotask(() => first.focus());
    } else {
      put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--primary', 'data-og-group-new': 'true', text: '모임 초안 만들기', onclick: () => { state.groupMode = 'new'; renderGroups(); } })));
      if (!list.length) put(card.body, el('p', { class: 'og-home-empty', 'data-og-community-empty': 'groups', text: '아직 만든 모임 초안이 없어요.' }));
      else
        put(
          card.body,
          el(
            'ul',
            { class: 'og-home-items', 'aria-label': '내 모임 초안' },
            list.map((g) => el('li', { class: 'og-home-item', 'data-og-group': g.id }, el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: g.name }), el('p', { class: 'og-home-item__meta', text: ['초안', labelOf(GROUP_CATEGORIES, g.category), labelOf(MEETING_STYLES, g.meetingStyle), g.region, `일정 초안 ${meetups.listFor(g.id).length}개`].filter(Boolean).join(' · ') }), g.description ? el('p', { class: 'og-home-item__text', text: summaryOf(g.description) }) : null), el('div', { class: 'og-home-item__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-group-open': g.id, 'aria-label': `‘${g.name}’ 초안 열기`, text: '열기', onclick: () => { state.groupId = g.id; renderGroups(); card.focusTitle(); } }))))
          )
        );
    }
    if (focusSelector) {
      const t = card.body.querySelector(focusSelector);
      if (t) t.focus();
    }
  }

  function renderGroupDetail(group) {
    const card = cards.groups;
    const back = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-group-back': 'true', text: '모임 초안 목록으로', onclick: () => { const id = state.groupId; state.groupId = ''; state.groupEdit = false; state.meetupEdit = ''; state.meetupCalendar = ''; renderGroups(`[data-og-group-open="${id}"]`); } });
    put(card.body, el('div', { class: 'og-form__actions' }, back));
    if (state.groupEdit === true) {
      const { form, first } = buildForm({
        label: '모임 초안 고치기',
        fields: groupFields(),
        values: group,
        submits: [{ id: 'save', label: '고친 내용 저장', primary: true }],
        onSubmit: (_, v) => {
          const r = groups.update(group.id, v);
          if (!r.ok) return r;
          state.groupEdit = false;
          renderGroups('[data-og-group-edit]');
          card.say('모임 초안을 고쳤어요.');
          return r;
        },
        onCancel: () => { state.groupEdit = false; renderGroups('[data-og-group-edit]'); },
      });
      form.dataset.ogGroupForm = 'edit';
      put(card.body, form);
      queueMicrotask(() => first.focus());
      return;
    }
    const rows = [['상태', '모임 초안 · 이 기기에만 있어요 · 회원 모집 전'], ['분류', labelOf(GROUP_CATEGORIES, group.category)], ['만나는 방식', labelOf(MEETING_STYLES, group.meetingStyle)], ['지역', group.region], ['만든 날', formatDate(group.createdAt)]].filter(([, v]) => v);
    put(
      card.body,
      el('h4', { class: 'og-life-sub og-community-name', 'data-og-group-name': 'true', text: group.name }),
      el('dl', { class: 'og-care-rows', 'aria-label': '모임 초안 정보' }, rows.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])),
      group.description ? el('p', { class: 'og-community-body', text: group.description }) : null
    );
    if (state.groupEdit === 'delete') {
      const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => { state.groupEdit = false; renderGroups('[data-og-group-delete]'); } });
      put(card.body, el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인' }, el('p', { text: `‘${group.name}’ 초안과 그 안의 일정 초안 ${meetups.listFor(group.id).length}개를 지울까요? 되돌릴 수 없어요.` }), el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--danger', 'data-og-group-delete-confirm': 'true', text: '지우기', onclick: () => { groups.remove(group.id); state.groupId = ''; state.groupEdit = false; renderGroups('[data-og-group-new]'); card.say(`‘${group.name}’ 초안을 지웠어요.`); } }))));
      queueMicrotask(() => cancel.focus());
    } else {
      put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-group-edit': 'true', text: '초안 고치기', onclick: () => { state.groupEdit = true; renderGroups(); } }), el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-group-delete': 'true', text: '초안 지우기', onclick: () => { state.groupEdit = 'delete'; renderGroups(); } })));
    }
    renderMeetups(group);
    put(card.body, el('p', { class: 'og-home-note', text: '아직 회원을 모으거나 함께 이야기할 수 없어요. 커뮤니티 서버와 신고·차단·운영 정책이 생기면 열 예정이에요.' }));
  }

  function meetupFields() {
    return [
      { name: 'title', label: '일정 이름', type: 'text', required: true, maxlength: COMMUNITY_LIMITS.meetupTitle },
      { name: 'date', label: '날짜', type: 'date', required: true },
      { name: 'time', label: '시간', type: 'time', required: false },
      { name: 'placeText', label: '장소', type: 'text', required: false, maxlength: COMMUNITY_LIMITS.meetupPlace, hint: '정확한 집 주소 대신 ‘○○공원 정문’처럼 공공장소 이름을 적어 주세요.' },
      { name: 'description', label: '설명', type: 'textarea', required: false, maxlength: COMMUNITY_LIMITS.meetupDescription },
    ];
  }

  function renderMeetups(group) {
    const card = cards.groups;
    const list = meetups.listFor(group.id);
    const headId = nextId('h');
    put(card.body, el('h4', { class: 'og-life-sub', id: headId, text: '모임 일정 초안' }));
    if (!list.length && state.meetupEdit !== 'new') put(card.body, el('p', { class: 'og-home-empty', 'data-og-meetup-empty': 'true', text: '아직 일정 초안이 없어요.' }));
    if (list.length)
      put(
        card.body,
        el(
          'ul',
          { class: 'og-home-items', 'aria-labelledby': headId },
          list.map((m) => {
            if (state.meetupEdit === m.id) return el('li', { class: 'og-home-item og-home-item--editing' }, meetupForm(group, m));
            const parts = [el('div', { class: 'og-home-item__main og-home-item__main--plain' }, el('p', { class: 'og-home-item__title', text: m.title }), el('p', { class: 'og-home-item__meta', text: [formatDateKey(m.date), m.time ? formatTime(m.time) : '', m.placeText].filter(Boolean).join(' · ') }), m.description ? el('p', { class: 'og-home-item__text', text: summaryOf(m.description, 120) }) : null)];
            if (state.meetupCalendar === m.id) parts.push(calendarPreview(m));
            else if (state.meetupEdit === `delete:${m.id}`) {
              const cancel = el('button', { type: 'button', class: 'og-btn og-btn--ghost', text: '취소', onclick: () => { state.meetupEdit = ''; renderGroups(`[data-og-meetup-delete="${m.id}"]`); } });
              parts.push(el('div', { class: 'og-confirm', role: 'group', 'aria-label': '지우기 확인' }, el('p', { text: `‘${m.title}’ 일정 초안을 지울까요?` }), el('div', { class: 'og-form__actions' }, cancel, el('button', { type: 'button', class: 'og-btn og-btn--danger', 'data-og-meetup-delete-confirm': m.id, text: '지우기', onclick: () => { meetups.remove(m.id); state.meetupEdit = ''; renderGroups('[data-og-meetup-new]'); card.say('일정 초안을 지웠어요.'); } }))));
              queueMicrotask(() => cancel.focus());
            } else
              parts.push(el('div', { class: 'og-home-item__actions og-community-actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-meetup-calendar': m.id, text: '내 일정에 추가', onclick: () => { state.meetupCalendar = m.id; renderGroups(`[data-og-meetup-calendar-add="${m.id}"]`); } }), el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-meetup-edit': m.id, 'aria-label': `‘${m.title}’ 고치기`, text: '고치기', onclick: () => { state.meetupEdit = m.id; renderGroups(); } }), el('button', { type: 'button', class: 'og-btn og-btn--ghost og-btn--small', 'data-og-meetup-delete': m.id, 'aria-label': `‘${m.title}’ 지우기`, text: '지우기', onclick: () => { state.meetupEdit = `delete:${m.id}`; renderGroups(); } })));
            return el('li', { class: 'og-home-item', 'data-og-meetup': m.id }, parts);
          })
        )
      );
    if (state.meetupEdit === 'new') put(card.body, meetupForm(group, null));
    else put(card.body, el('div', { class: 'og-form__actions' }, el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-meetup-new': 'true', text: '일정 초안 추가', onclick: () => { state.meetupEdit = 'new'; renderGroups(); } })));
  }

  function meetupForm(group, meetup) {
    const { form, first } = buildForm({
      label: meetup ? '일정 초안 고치기' : '일정 초안 추가',
      fields: meetupFields(),
      values: meetup || { date: dateKey(now()) },
      submits: [{ id: 'save', label: '일정 초안 저장', primary: true }],
      onSubmit: (_, v) => {
        const r = meetup ? meetups.update(meetup.id, v) : meetups.add(group.id, v);
        if (!r.ok) return r;
        state.meetupEdit = '';
        renderGroups(`[data-og-meetup-calendar="${r.meetup.id}"]`);
        cards.groups.say(`일정 초안을 저장했어요. 참가자를 모으는 것은 아니에요.${r.check && (r.check.phone || r.check.address) ? ' 장소에 자세한 주소나 전화번호가 있다면 공공장소 이름으로 바꿔 주세요.' : ''}`);
        return r;
      },
      onCancel: () => { state.meetupEdit = ''; renderGroups('[data-og-meetup-new]'); },
    });
    form.dataset.ogMeetupForm = meetup ? 'edit' : 'new';
    queueMicrotask(() => first.focus());
    return form;
  }

  function calendarPreview(m) {
    const draft = meetupCalendarDraft(m);
    const already = isMeetupInCalendar(draft, schedule.listForDate(draft.date));
    const status = el('p', { class: 'og-live', role: 'status', 'aria-live': 'polite' });
    const close = el('button', { type: 'button', class: 'og-btn og-btn--ghost', 'data-og-meetup-calendar-close': m.id, text: '닫기', onclick: () => { state.meetupCalendar = ''; renderGroups(`[data-og-meetup-calendar="${m.id}"]`); } });
    const add = el('button', {
      type: 'button',
      class: 'og-btn og-btn--primary',
      'data-og-meetup-calendar-add': m.id,
      disabled: already,
      text: already ? '이미 내 일정에 있어요' : '내 일정에 추가',
      onclick: () => {
        if (isMeetupInCalendar(draft, schedule.listForDate(draft.date))) {
          status.textContent = '이미 내 일정에 있어요. 다시 추가하지 않았어요.';
          return;
        }
        const r = schedule.add({ title: draft.title, date: draft.date, time: draft.time });
        status.textContent = r.ok ? '내 일정에 추가했어요. 내 생활 › 캘린더에서 볼 수 있어요.' : '추가하지 못했어요.';
        if (r.ok) {
          add.disabled = true;
          add.textContent = '내 일정에 추가했어요';
          close.focus();
        }
      },
    });
    return el('div', { class: 'og-confirm', role: 'group', 'aria-label': '내 일정에 추가 미리 보기', 'data-og-meetup-preview': m.id }, el('dl', { class: 'og-care-rows' }, el('dt', { text: '일정 이름' }), el('dd', { text: draft.title }), el('dt', { text: '날짜' }), el('dd', { text: formatDateKey(draft.date) }), draft.time ? el('dt', { text: '시간' }) : null, draft.time ? el('dd', { text: formatTime(draft.time) }) : null), el('div', { class: 'og-form__actions' }, add, close), status);
  }

  /* ───────── build ───────── */

  function build() {
    clear(host);
    cards = {
      posts: createCard({ area: 'community', slot: 'mine', title: '내 글', level: 1 }),
      groups: createCard({ area: 'community', slot: 'groups', title: '모임 준비', level: 2, lead: '함께하고 싶은 모임을 초안으로 만들어 두세요. 아직 다른 사람이 보거나 가입할 수 없어요.' }),
      discover: createCard({ area: 'community', slot: 'discover', title: '공개 모임 찾기', level: 3 }),
      safety: createCard({ area: 'community', slot: 'safety', title: '함께 지킬 것', level: 3 }),
    };
    put(cards.discover.body, el('p', { class: 'og-home-empty', 'data-og-community-empty': 'directory', text: '공개된 모임 목록은 아직 없어요.' }), el('p', { class: 'og-home-note', text: '커뮤니티 서버가 생기면 지역과 관심사로 모임을 찾고, 직접 확인한 뒤 함께할 수 있게 만들 예정이에요.' }));
    put(cards.safety.body, el('ul', { class: 'og-family-points' }, el('li', { text: PRIVACY_HINT }), el('li', { text: '처음 만나는 모임은 사람이 많은 공공장소에서 만나요.' }), el('li', { text: '내 건강 기록이나 가족 공유 설정은 커뮤니티에 함께 올라가지 않아요.' }), el('li', { text: 'ONGIL은 아직 글을 자동으로 검사하거나 신고를 받지 않아요.' })));
    put(
      host,
      el(
        'div',
        { class: 'og-wrap og-community' },
        el('p', { class: 'og-label', lang: 'en', text: 'COMMUNITY' }),
        el('h2', { class: 'og-h', id: 'og-community-section-title', tabindex: '-1', text: '커뮤니티' }),
        el('p', { class: 'og-lead', text: '묻고 싶은 것, 나누고 싶은 경험, 함께하고 싶은 모임을 적어 두는 곳입니다.' }),
        el('div', { class: 'og-care-grid' }, cards.posts.root, cards.groups.root, cards.discover.root, cards.safety.root)
      )
    );
    renderPosts();
    renderGroups();
    host.dataset.ogRendered = 'true';
  }

  /* #community/write opens the form; #community/groups goes to 모임 준비 */
  function show(section) {
    for (const c of Object.values(cards)) c.status.textContent = '';
    if (section === 'write') {
      if (!state.compose) openCompose({});
      return;
    }
    renderPosts();
    renderGroups();
    if (section === 'groups') cards.groups.root.scrollIntoView({ block: 'start' });
  }

  /* 즐길거리 › 후기 쓰기: opens the form with type/category/title filled in. Nothing is saved until the user saves. */
  function startReview(prefill) {
    if (!prefill) return false;
    openCompose({ type: prefill.type, category: prefill.category, title: prefill.title, body: '', source: prefill.source });
    return true;
  }

  build();
  return Object.freeze({ show, startReview, render: () => { renderPosts(); renderGroups(); } });
}
